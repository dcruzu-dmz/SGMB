# Resultados de Pruebas Unitarias (v2) — SGMB

Segunda tanda: **exactamente 10 pruebas UNITARIAS (U)**, cada una probando **una función Python aislada**, sin base de datos real, sin HTTP y sin navegador. Donde la función real necesita una sesión de base de datos (`run_preventive_check`), se usó un **mock** (`unittest.mock.MagicMock`) en vez de una base de datos.

- Archivo de pruebas: [backend/tests/test_units_v2.py](../tests/test_units_v2.py)
- Log de las 5 corridas: [logs/unit_runs.log](logs/unit_runs.log)
- Total de ejecuciones: 10 pruebas × 5 corridas = **50**
- Resultado global: **50/50 OK (100%), 0 fallidas**

## Tabla 1 — Listado completo de pruebas

| ID | Módulo | Tipo | Caso | Datos | Pasos | Esperado | Obtenido | Estado |
|---|---|---|---|---|---|---|---|---|
| AUTH-U01 | Auth | U | Hash y verificación de contraseña | plain="MiClaveSegura123" | 1) hash_password(plain) 2) verify_password(plain, hash) | Hash ≠ texto plano; verify_password=True | Hash distinto; verify_password=True | OK |
| AUTH-U02 | Auth | U | Rechazo de contraseña incorrecta | hash de "ClaveCorrecta1", intento="ClaveIncorrecta9" | 1) verify_password(incorrecta, hash) | Devuelve False | Devuelve False | OK |
| AUTH-U03 | Auth | U | Token inválido no lanza excepción | token="esto-no-es-un-jwt-valido" | 1) verify_token(token) | Devuelve None (sin excepción) | Devuelve None | OK |
| RBAC-U01 | Control de Acceso | U | Acceso permitido con rol correcto | usuario mock con role="admin" | 1) require_roles("admin")(usuario) | Devuelve el mismo usuario | Devuelve el usuario | OK |
| RBAC-U02 | Control de Acceso | U | Acceso denegado con rol incorrecto | usuario mock con role="tecnico" | 1) require_roles("admin")(usuario) | HTTPException 403 | HTTPException 403 | OK |
| VIS-U01 | Visitas | U | Acceso permitido al técnico asignado | visita con technician_id=5, usuario id=5 | 1) _check_visit_access(visita, usuario) | No lanza excepción | No lanzó excepción | OK |
| VIS-U02 | Visitas | U | Acceso denegado a técnico no asignado | visita con technician_id=99, usuario id=5 | 1) _check_visit_access(visita, usuario) | HTTPException 403 | HTTPException 403 | OK |
| VIS-U03 | Visitas | U | Mantenimiento preventivo no genera visita si no está vencida (mock de BD) | sucursal mock frecuencia=30d, última visita mock hace 5 días | 1) run_preventive_check(db_mock) | created=0; db.commit() no se llama | created=0; commit no llamado | OK |
| SOL-U01 | Solicitudes Correctivas | U | Rechazo por falta de descripción | asset_id=1, requester_id=1, priority="alta" (sin description) | 1) CorrectiveRequestCreate(...) | ValidationError de Pydantic | ValidationError lanzada | OK |
| SOL-U02 | Solicitudes Correctivas | U | Acceso denegado a técnico no asignado | solicitud con assigned_id=99, usuario id=7 | 1) _check_request_access(solicitud, usuario) | HTTPException 403 | HTTPException 403 | OK |

## Tabla 2 — Resultados numéricos (por módulo)

| Módulo | Métrica | Valor | Unidad | Versión/Fecha |
|---|---|---|---|---|
| Auth | % de pruebas OK | 100 | % | v1.0 – 2026-09-15 |
| Auth | Total ejecuciones | 15 | ejecuciones | v1.0 – 2026-09-15 |
| Auth | Total fallidas | 0 | ejecuciones | v1.0 – 2026-09-15 |
| Auth | Duración promedio | 292.27 | ms | v1.0 – 2026-09-15 |
| Auth | p95 latencia | 520 | ms | v1.0 – 2026-09-15 |
| Control de Acceso | % de pruebas OK | 100 | % | v1.0 – 2026-09-15 |
| Control de Acceso | Total ejecuciones | 10 | ejecuciones | v1.0 – 2026-09-15 |
| Control de Acceso | Total fallidas | 0 | ejecuciones | v1.0 – 2026-09-15 |
| Control de Acceso | Duración promedio | 0.03 | ms | v1.0 – 2026-09-15 |
| Control de Acceso | p95 latencia | 0.05 | ms | v1.0 – 2026-09-15 |
| Visitas | % de pruebas OK | 100 | % | v1.0 – 2026-09-15 |
| Visitas | Total ejecuciones | 15 | ejecuciones | v1.0 – 2026-09-15 |
| Visitas | Total fallidas | 0 | ejecuciones | v1.0 – 2026-09-15 |
| Visitas | Duración promedio | 0.60 | ms | v1.0 – 2026-09-15 |
| Visitas | p95 latencia | 1.80 | ms | v1.0 – 2026-09-15 |
| Solicitudes Correctivas | % de pruebas OK | 100 | % | v1.0 – 2026-09-15 |
| Solicitudes Correctivas | Total ejecuciones | 10 | ejecuciones | v1.0 – 2026-09-15 |
| Solicitudes Correctivas | Total fallidas | 0 | ejecuciones | v1.0 – 2026-09-15 |
| Solicitudes Correctivas | Duración promedio | 0.03 | ms | v1.0 – 2026-09-15 |
| Solicitudes Correctivas | p95 latencia | 0.04 | ms | v1.0 – 2026-09-15 |

*El p95 se calculó sobre el valor más alto observado dentro de las ejecuciones de cada módulo (grupos pequeños de 10-15 muestras), no con interpolación estadística de una muestra grande.*

## Gráficas (por módulo)

| Módulo | % OK | Duración |
|---|---|---|
| Auth / Control de Acceso | [graf_ok_auth.png](screenshots/graf_ok_auth.png) | [graf_dur_auth.png](screenshots/graf_dur_auth.png) |
| Visitas | [graf_ok_visitas.png](screenshots/graf_ok_visitas.png) | [graf_dur_visitas.png](screenshots/graf_dur_visitas.png) |
| Solicitudes | [graf_ok_solicitudes.png](screenshots/graf_ok_solicitudes.png) | [graf_dur_solicitudes.png](screenshots/graf_dur_solicitudes.png) |

**Interpretación:** las 10 pruebas mantienen el 100% de éxito en las 50 ejecuciones, confirmando que la lógica aislada de autenticación, control de acceso por rol y las reglas de negocio de Visitas/Solicitudes son correctas y deterministas. La única duración no despreciable corresponde a `hash_password`/`verify_password` (~430-446 ms), por el costo intencional de bcrypt; todas las demás pruebas —al no tocar criptografía ni I/O real— ejecutan en fracciones de milisegundo, como corresponde a pruebas unitarias puras.
