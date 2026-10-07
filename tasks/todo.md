# Tareas: endurecer el contrato de usuarios

Ver `tasks/plan.md`. Rama: `fix/contrato-usuarios`.

## Fase 1

- [x] **T1: Proteger al último admin y evitar auto-bloqueo**
  - Acceptance:
    - Un admin que se desactiva a sí mismo (PATCH `/users/{id}/status` o PUT con `is_active=false`) recibe 409 "No puedes desactivar tu propia cuenta".
    - Un admin que se cambia su propio rol recibe 409 "No puedes cambiar tu propio rol".
    - Desactivar o degradar al último admin activo da 409 "Debe quedar al menos un administrador activo".
    - Con 2 admins activos, un admin sí puede desactivar o degradar al otro.
    - Editar nombre o correo propio sigue funcionando.
    - El toast de activar/desactivar muestra el mensaje del backend.
  - Verify: `curl` con 2 admins de prueba (seed temporal) cubriendo los 5 casos; tests unitarios en verde.
  - Files: `backend/app/routers/users.py`, `frontend/src/app/features/users/pages/users-list/users-list.component.ts`

- [x] **T2: Errores de validación legibles en todo el frontend**
  - Acceptance:
    - Un 422 con `detail` en lista llega a las pantallas como texto: `Datos inválidos: <campos>`.
    - Los errores con `detail` de texto (400/403/404/409) no cambian.
    - Crear un usuario con un correo inválido (ej. `x@y`) muestra el mensaje legible, no `[object Object]`.
  - Verify: Playwright headless en Gestión de usuarios con correo inválido; `ng build`.
  - Files: `frontend/src/app/core/interceptors/auth-interceptor.ts`

- [x] **T3: Correos sin distinción de mayúsculas**
  - Acceptance:
    - Alta y edición guardan el correo en minúsculas.
    - Login con `Correo@SGMB.com` funciona para `correo@sgmb.com`.
    - Crear `JUAN@x.com` cuando existe `juan@x.com` da el error de correo duplicado.
  - Verify: `curl` con usuario de prueba; tests unitarios.
  - Files: `backend/app/schemas/user.py`, `backend/app/schemas/auth.py`

## Checkpoint

- [x] Tests unitarios (24) y `ng build` en verde
- [x] Verificación en vivo de T1–T3 con datos temporales, y limpieza
- [x] Commit, push y PR; mergeado como #10

## Fase 2 (opcional, después del checkpoint)

- [x] **T4: Tipo `UserRole` en TypeScript** — `role: 'admin' | 'tecnico' | 'solicitante'` en `User`, `CurrentUser`, `UserCreate`, `UserUpdate`. Verify: `ng build`.
- [x] **T5: Correo duplicado responde 409** en lugar de 400. Verify: `curl`.
