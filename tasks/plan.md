# Plan: endurecer el contrato de usuarios

Origen: revisión de interfaces de usuario (2026-10-07), hallazgos 1–3. Los hallazgos 5 y 6 quedan como fase 2 opcional; el 4 (token con `sub = email`) solo se documenta.

## Estado actual relevante

- `backend/app/routers/users.py`: `update_user` (PUT) y `toggle_user_status` (PATCH `/status`) no miran a quién se modifica.
- Base de datos (consulta de solo lectura): 5 usuarios, **2 admins activos**, ningún correo con mayúsculas ni duplicados ignorando mayúsculas. Por eso el punto 3 no necesita migrar datos.
- `frontend/src/app/core/interceptors/auth-interceptor.ts`: ya intercepta todos los errores HTTP (lo usa el manejo de 401). Es el único punto por donde pasan los errores de todas las pantallas.
- 10 lugares del frontend muestran `err.error.detail` directo (usuarios, visitas, solicitudes, login).

## Dependencias

```
T1 (último admin)      ──┐
T2 (errores 422 legibles) ─┼──► Checkpoint (verificación en vivo + PR)
T3 (correos sin mayúsculas)┘
```

Las tres tareas son independientes entre sí; van en un solo PR porque son pequeñas y tocan el mismo módulo. T2 mejora cómo se ven los errores de T1 y T3, por eso conviene verificarlas juntas.

## Decisiones de diseño

**T1 — reglas (todas responden 409 con mensaje en español):**
1. Un admin no puede desactivarse a sí mismo.
2. Un admin no puede cambiarse su propio rol.
3. Ningún cambio puede dejar el sistema sin admins activos (desactivar o degradar al último).

Las reglas 1–2 evitan que una persona se quede fuera sin querer; la 3 evita que el sistema se quede sin nadie que lo administre. Se aplican en un helper compartido que usan los dos endpoints, y se valida en el backend (el frontend solo muestra el mensaje).

**T2 — dónde normalizar:** en el interceptor, no en cada pantalla. Si `error.detail` es una lista (422 de FastAPI), se reemplaza por un texto: `Datos inválidos: <campos>`. Así los 10 lugares que ya leen `detail` como texto quedan bien sin tocarlos.

**T3 — cómo:** un tipo `Email` en los schemas que valida con `EmailStr` y convierte a minúsculas. Se usa en alta, edición y login. Como los datos actuales ya están en minúsculas, las comparaciones exactas existentes siguen funcionando.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| T1 bloquea un flujo legítimo del admin | Solo bloquea sobre sí mismo o sobre el último admin; con 2 admins activos, el admin puede degradar o desactivar al otro. |
| T2 oculta información útil del 422 | Se conservan los nombres de los campos en el mensaje. |
| T3 rompe el login de alguien | Verificado: no hay correos con mayúsculas en la base. |

## Fuera de alcance

- Fase 2 (opcional, después del checkpoint): T4 tipo `UserRole` en TypeScript, T5 correo duplicado → 409.
- Hallazgo 4 (`sub = email` en el token): solo documentar; cambiarlo cierra todas las sesiones al desplegar.
