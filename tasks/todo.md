# Tareas: scheduler preventivo sin duplicados (punto 18)

Ver `tasks/plan.md`. Rama: `fix/scheduler-sin-duplicados`. Supone la opción A (candado de Postgres).
La lista anterior (contrato de usuarios, completa) está en el historial de git, PR #12.

- [x] **T1: Corrida del chequeo con candado de Postgres**
  - Acceptance:
    - Dos corridas simultáneas sobre una sucursal vencida crean **una** visita, no dos.
    - Si otra corrida está en curso, la segunda no hace nada y lo informa (`None` en la función).
    - `run_preventive_check` sin candado sigue igual (tests unitarios en verde).
  - Verify: prueba de concurrencia en una **base temporal** de Postgres: dos hilos llaman a la versión con candado a la vez → 1 visita creada; la misma prueba sin candado → reproduce el duplicado (demuestra que la prueba detecta el problema).
  - Files: `backend/app/services/preventive_scheduler.py`

- [ ] **T2: Loop y botón manual usan la versión con candado**
  - Acceptance:
    - `preventive_check_loop` y `POST /maintenance-visits/check-preventive` usan la versión con candado.
    - El endpoint responde `{"created": N, "skipped": false}` o `{"created": 0, "skipped": true}`.
    - El frontend que llama al botón sigue funcionando (lee `created`).
  - Verify: `curl` al endpoint con admin temporal; e2e; `ng build` si cambia el frontend.
  - Files: `backend/app/services/preventive_scheduler.py`, `backend/app/routers/maintenance_visit.py` (y el componente que llama al endpoint, solo si hace falta)

## Checkpoint

- [ ] Tests unitarios, e2e y CI en verde
- [x] Prueba de concurrencia: 1 visita con candado, duplicado reproducido sin candado (tests SCH01/SCH02)
- [ ] Commit, push y PR; mergear cuando lo apruebes

## Decisión pendiente (no incluida)

- [ ] Opción B (índice único parcial): solo si confirmas que **nunca** debe haber dos visitas pendientes para una misma sucursal.
