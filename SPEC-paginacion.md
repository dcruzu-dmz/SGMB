# Spec: rendimiento de los listados (auditoría, punto 15)

## Objetivo

El punto 15 de la auditoría decía "listas sin paginación en el backend". Antes de paginar se midió el problema real (2026-10-07, base de desarrollo, con sesión de admin):

| Endpoint | Filas | Tamaño | Tiempo |
|---|---|---|---|
| `/branches` | 303 | 63 KB | 12 ms |
| `/assets` | 26 | 9 KB | 6 ms |
| `/users` | 7 | 1 KB | 5 ms |
| `/correctiverequest` | 7 | 2 KB | 5 ms |
| **`/maintenance-visits`** | **10** | **64 KB** | **389 ms** |
| `/assigned-tasks` | 1 | 0.3 KB | 8 ms |

**Hallazgo:** el problema no es la falta de paginación sino la lista de visitas. Sus tres `joinedload` encadenados (equipos → fotos, equipos → checklist, checklist de la visita) generan un producto cruzado: **19 349 filas para 327 registros reales**. El costo crece multiplicativamente con las fotos y el checklist de cada visita, así que con unos cientos de visitas la pantalla tardaría segundos. Con `selectinload` la misma lista tarda **10 ms** (5 consultas en vez de 1 JOIN gigante), ~35× más rápido, con exactamente la misma respuesta.

**La paginación del servidor no se justifica todavía:** la lista más grande (sucursales, 303 filas) responde en 12 ms, las 5 pantallas con tablas ya paginan y buscan en el navegador, y 13 pantallas usan las listas completas para buscar nombres (`getBranchName`, selectores, reportes). Paginar en el servidor obligaría a rehacer esas 13 pantallas sin beneficio medible hoy.

**Éxito:** la lista de visitas responde en < 50 ms con los datos actuales y su costo crece linealmente con las visitas, sin cambiar el contrato de la API ni el frontend.

## Alcance

1. **Cambiar `joinedload` por `selectinload`** en `VISIT_LOAD_OPTIONS` (`backend/app/routers/maintenance_visit.py`). Lo usan el listado, el detalle y las respuestas de crear/editar visitas; todos se benefician.
2. **Dejar documentado el umbral** para la paginación real: retomarla cuando alguna lista supere ~2 000 filas o ~200 ms. Cuando llegue, se haría **aditiva**: parámetros opcionales `limit`/`offset` y el total en una cabecera `X-Total-Count`, manteniendo la respuesta como lista. Así las pantallas actuales siguen funcionando y solo las tablas grandes adoptan la paginación.

## Comandos

```
Tests:     cd backend && venv/bin/python -m pytest tests/test_units.py tests/test_units_v2.py tests/test_authz.py -q
Medición:  script de perfilado (scratchpad) que cuenta consultas y mide el tiempo de VISIT_LOAD_OPTIONS
Build:     cd frontend && npx ng build
```

## Estructura y archivos afectados

| Archivo | Cambio |
|---|---|
| `backend/app/routers/maintenance_visit.py` | `joinedload` → `selectinload` en `VISIT_LOAD_OPTIONS` (3 líneas y el import). |
| `SPEC-paginacion.md` | Este documento, con el umbral para la paginación futura. |

Sin cambios en modelos, esquema de la base, schemas de respuesta ni frontend.

## Estilo de código

```python
VISIT_LOAD_OPTIONS = [
    selectinload(MaintenanceVisit.items).selectinload(MaintenanceVisitItem.photos),
    selectinload(MaintenanceVisit.items).selectinload(MaintenanceVisitItem.checklist_entries),
    selectinload(MaintenanceVisit.checklist_entries),
]
```

## Estrategia de verificación

- **Misma respuesta:** el JSON de `/maintenance-visits/` y de `/maintenance-visits/{id}` es idéntico antes y después (comparación byte a byte con datos temporales de `seed.sh` más las visitas existentes).
- **Rendimiento:** número de consultas y tiempo antes/después con el script de perfilado; `curl` a `/maintenance-visits/` < 50 ms.
- **Regresión:** tests unitarios, e2e (3) y el CI del PR.

## Límites

- **Siempre:** mantener el contrato de la API intacto; medir antes y después.
- **Preguntar antes:** cambiar la forma de cualquier respuesta, agregar paginación de servidor.
- **Nunca:** paginar sin actualizar las pantallas que necesitan la lista completa.

## Criterios de éxito

- `/maintenance-visits/` < 50 ms con los datos actuales (hoy 389 ms).
- Respuestas idénticas antes y después.
- Tests unitarios, e2e y CI en verde.

## Preguntas abiertas

1. **¿Aceptas reenfocar el punto 15** en arreglar la lista de visitas, que es el problema medido, y dejar la paginación de servidor documentada para cuando haga falta? La alternativa es paginar ahora todos los listados, que implica rehacer ~13 pantallas.
2. **Respuesta más liviana para listados:** la lista de visitas devuelve también todo el checklist y las fotos de cada visita (64 KB para 10 visitas), aunque las pantallas de listado solo usan parte. Achicarla cambiaría el contrato y las 3 pantallas que la consumen. ¿Lo dejamos fuera, como propongo, o lo incluimos?

## Resultado (implementado)

Decisiones: se aceptó el reenfoque; la respuesta más liviana (pregunta 2) quedó fuera.

| Medición | Antes | Después |
|---|---|---|
| `GET /maintenance-visits/` (10 visitas) | 346 ms | 13–15 ms |
| Filas que lee la base para listar visitas | 19 349 (1 consulta) | 5 consultas, sin producto cruzado |
| Respuestas con el mismo contenido (lista + 10 detalles) | — | 11/11 |
| Colecciones en orden de creación (equipos, fotos, checklist) | 2/32 (orden arbitrario del JOIN) | 32/32 |

Además del `selectinload`, las 4 colecciones de visitas (`items`, `checklist_entries`, `photos`) tienen `order_by=id` en el modelo: antes su orden dependía de cómo Postgres resolvía el JOIN, ahora es siempre el orden de creación. No cambia el esquema (`alembic check` sin diferencias).
