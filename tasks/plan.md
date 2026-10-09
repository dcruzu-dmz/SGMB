# Plan: scheduler preventivo sin visitas duplicadas (auditoría, punto 18)

El plan anterior (contrato de usuarios, completo) está en el historial de git, PR #12.

## Por qué puede duplicar

`backend/app/main.py` arranca el scheduler dentro del `lifespan` de FastAPI:

```python
scheduler = asyncio.create_task(preventive_check_loop())
```

El `lifespan` corre **una vez por proceso**. Hoy hay un solo proceso (`uvicorn --reload`), así que hoy no duplica. Pero:

1. **Con varios workers** (`uvicorn --workers 4`, lo normal en producción) habría 4 loops, uno por proceso, revisando las mismas sucursales al mismo tiempo.
2. **El chequeo no es atómico.** `run_preventive_check` (`services/preventive_scheduler.py`) hace "¿hay visita pendiente para esta sucursal?" y después "si no, la creo". Si dos procesos hacen la pregunta a la vez, los dos ven "no hay" y los dos crean la visita: **dos visitas programadas para la misma sucursal**.
3. **También pasa con un solo proceso**: el endpoint `POST /maintenance-visits/check-preventive` (botón del admin) llama a la misma función. Si coincide con la corrida automática, se da la misma carrera.

Estado actual de la base (consulta de solo lectura, 2026-10-08): 4 visitas pendientes en 4 sucursales, **ninguna duplicada**; 1 sucursal activa con frecuencia configurada. El riesgo es real pero todavía no ocurrió.

## Opciones

| Opción | Cómo | Pros | Contras |
|---|---|---|---|
| **A. Candado de Postgres** (recomendada) | `pg_try_advisory_xact_lock` al inicio de cada corrida: si otro proceso ya está revisando, esta corrida se salta. | ~10 líneas, sin migración, cubre workers y botón manual, no cambia reglas de negocio. | Solo protege al scheduler; no impide que un admin cree a mano una segunda visita pendiente (eso hoy es válido). |
| B. Índice único parcial | `UNIQUE (branch_id) WHERE status IN ('programada','borrador')` vía migración. | Garantía absoluta en la base. | **Cambia una regla de negocio**: el admin ya no podría tener dos visitas pendientes para una misma sucursal (por ejemplo, programar dos fechas futuras). Requiere tu decisión. |
| C. Scheduler fuera del web | Un proceso o cron aparte que corre el chequeo. | Separación limpia. | Más infraestructura que mantener; sigue necesitando A para el botón manual. |

## Diseño de la opción A

- Nueva función `run_preventive_check_locked(db)` en `services/preventive_scheduler.py`: toma `pg_try_advisory_xact_lock(<clave fija>)` en la misma transacción. Si no obtiene el candado, devuelve `None` ("otra corrida en curso") sin hacer nada; si lo obtiene, llama a `run_preventive_check(db)`. El candado se libera solo al terminar la transacción (commit o rollback).
- `run_preventive_check` no cambia: los tests unitarios que la usan con SQLite y mocks siguen funcionando.
- El loop y el endpoint usan la versión con candado. El endpoint responde `{"created": 0, "skipped": true}` si otra corrida estaba en curso, para que el admin sepa por qué no se creó nada.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El candado no se libera | Es `xact` (de transacción): Postgres lo libera al cerrar la transacción, incluso si el proceso muere. |
| Una corrida se salta | El loop vuelve a correr a las 6 h y el admin puede reintentar; saltar es preferible a duplicar. |
| Tests con SQLite | La función original no cambia; la versión con candado solo se usa en el loop y el endpoint (Postgres). |
