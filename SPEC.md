# Spec: Endurecer autorización y subida de archivos (auditoría, puntos 1–4)

## Objetivo

Cerrar los huecos de la auditoría del 2026-10-06: hoy el backend solo restringe al rol `tecnico` y deja pasar a todos los demás roles, y además acepta cualquier archivo. El backend tiene que ser la fuente de verdad de los permisos; el frontend solo oculta botones.

Regla general: **se niega todo salvo que el permiso esté explícito** (antes era "se permite todo salvo `tecnico` ajeno").

### Matriz de permisos propuesta

**Visitas de mantenimiento** (`/maintenance-visits`)

| Acción | admin | tecnico | solicitante |
|---|---|---|---|
| Listar y ver | todas | solo las asignadas | todas, solo lectura ❓ |
| Crear, eliminar, chequeo preventivo | ✅ | ❌ | ❌ |
| Editar la cabecera | todos los campos | solo las asignadas, sin `branch_id`, `technician_id` ni `supervisor_observations` ❓ | ❌ |
| Equipos, checklist, fotos, hoja firmada | ✅ | solo las asignadas | ❌ |

**Solicitudes correctivas** (`/correctiverequest`)

| Acción | admin | tecnico | solicitante |
|---|---|---|---|
| Listar y ver | todas | solo las asignadas | solo las propias ❓ |
| Crear | ✅, puede indicar `requester_id` | ❌ | ✅, `requester_id` se fuerza a `current_user.id` |
| Editar (`PUT`) | todos los campos | solo las asignadas: `status` y `solution` | solo las propias: `description` y `priority`, mientras estén en `abierta` ❓ |
| Cambiar estado (`PATCH`) | ✅ | solo las asignadas | ❌ |
| Subir o borrar la hoja firmada | ✅ | solo las asignadas | ❌ ❓ |

**Archivos subidos** (fotos y hojas firmadas)

- Extensiones permitidas: fotos `.jpg`, `.jpeg`, `.png`, `.webp`; hojas firmadas `.pdf`, `.jpg`, `.jpeg`, `.png`. Todo lo demás devuelve **400**.
- Se valida la extensión, el `content_type` declarado **y** la firma de los primeros bytes (`%PDF`, `\xFF\xD8\xFF`, `\x89PNG`, `RIFF....WEBP`). El nombre en disco usa la extensión normalizada, nunca la que manda el cliente.
- Tamaño máximo: **10 MB por archivo**. Se lee por bloques y se corta al pasar el límite (**413**), sin cargar el archivo completo en memoria. Si hay error, se borra el archivo parcial.
- El montaje `/uploads` queda **público** ❓. Con la lista blanca ya no se puede servir HTML/SVG, así que se elimina el XSS. Exigir autenticación para descargar es otro cambio (ver Preguntas abiertas).

## Tech Stack

FastAPI + SQLAlchemy 2 + Pydantic v2 (backend, Python 3.13) y Angular 21 (frontend). No se agregan dependencias.

## Comandos

```
Tests:  cd backend && venv/bin/python -m pytest tests/test_units.py tests/test_units_v2.py tests/test_authz.py -q
Grafo:  graphify update .
```

`tests/test_integration.py` **no** se corre porque escribe en la base de datos real (es el punto 8 de la auditoría, fuera de este alcance).

## Estructura y archivos afectados

| Archivo | Cambio |
|---|---|
| `backend/app/utils/uploads.py` (nuevo) | `save_upload(file, dest_dir, allowed) -> filename`, que valida extensión, MIME, firma y tamaño. Reemplaza las 3 copias del código de subida. |
| `backend/app/routers/maintenance_visit.py` | `_check_visit_access` pasa a ser "admin o técnico asignado"; nuevo `_check_visit_read` para el solicitante; lista blanca de campos para el técnico en `update_visit`; usa `save_upload`. |
| `backend/app/routers/corrective_request.py` | `_check_request_access` según el rol; filtro por `requester_id` para el solicitante; `requester_id` forzado al crear; lista blanca de campos por rol en `PUT`; `PATCH` y hoja firmada sin acceso para el solicitante; usa `save_upload`. |
| `backend/create_admin.py` | La contraseña se lee de `ADMIN_PASSWORD` (variable de entorno) o se pide con `getpass`; se elimina `Admin123`. |
| `backend/.env.example` | Se documenta `ADMIN_PASSWORD` (opcional). |
| `backend/tests/test_authz.py` (nuevo) | Tests de la matriz y de las subidas (ver Testing). |
| `frontend/.../corrective-requests-list.component.html` / `.ts` | El solicitante deja de ver los botones que ahora dan 403 (editar o subir en solicitudes ajenas o cerradas) ❓ |

No se toca: modelos ni esquema de la base, `asset.py` (ya restringe bien), `users.py`, `branch.py`.

## Estilo de código

Se siguen los patrones existentes, como los helpers `_check_*` y las listas blancas tipo `TECHNICIAN_ALLOWED_STATUSES` de `asset.py`:

```python
TECHNICIAN_VISIT_FIELDS = set(MaintenanceVisitUpdate.model_fields) - {
    "branch_id", "technician_id", "supervisor_observations",
}

def _check_visit_write(visit: MaintenanceVisit, current_user: User) -> None:
    if current_user.role == "admin":
        return
    if current_user.role == "tecnico" and visit.technician_id == current_user.id:
        return
    raise HTTPException(status_code=403, detail="No tienes acceso a esta visita")
```

Los mensajes de error van en español, como el resto de la API. Si un técnico manda un campo que no está en su lista blanca, se responde **403** (no se ignora en silencio), igual que hace `update_asset` hoy.

## Estrategia de testing

`backend/tests/test_authz.py` con `TestClient` sobre una app de prueba que monta solo los routers involucrados (así se evita importar `app.main`, cuyo `create_all` se conecta a Postgres), con `dependency_overrides[get_db]` → SQLite en memoria y `get_current_user` sobrescrito por rol. Casos mínimos:

1. El solicitante recibe 403 al hacer `PUT /maintenance-visits/{id}`, al subir fotos y al borrar la hoja firmada.
2. Un técnico no asignado recibe 403 y el asignado 200. Si el asignado cambia `technician_id`, recibe 403.
3. Al crear una solicitud, el solicitante con `requester_id` de otra persona queda guardado con su propio id.
4. El solicitante no ve en `GET /correctiverequest` las solicitudes ajenas.
5. El técnico asignado que cambia `assigned_id` recibe 403.
6. Subir `.html`, un `.png` con contenido HTML o un archivo de más de 10 MB da 400/413 y no deja nada en disco. Un PDF real da 200.

Para comprobar que los tests detectan regresiones: se revierte temporalmente el chequeo de rol y al menos un test tiene que fallar.

## Límites

- **Siempre:** denegar por defecto, mantener los códigos 403/404 actuales, correr los tests antes de cada commit y ejecutar `graphify update .` al terminar.
- **Preguntar antes:** cambios de esquema o modelos, nuevas dependencias, exigir autenticación en `/uploads`, cambios del frontend más allá de ocultar botones.
- **Nunca:** correr `test_integration.py` contra la base real, borrar archivos existentes en `uploads/`, ni hacer push sin que lo pidas.

## Criterios de éxito

- Todas las celdas ❌ de la matriz devuelven 403 (o 404 cuando el recurso no existe), y está cubierto por tests.
- El técnico no puede reasignarse visitas ni solicitudes.
- `requester_id` no se puede falsificar.
- Ningún endpoint de subida acepta archivos fuera de la lista blanca ni de más de 10 MB.
- `create_admin.py` no contiene ninguna contraseña.
- Los 13 tests existentes siguen pasando.

## Preguntas abiertas (marcadas con ❓)

1. **Visitas para el solicitante:** ¿solo lectura de todas (propuesto), o ningún acceso?
2. **Solicitudes para el solicitante:** ¿solo las propias (propuesto) o todas en lectura? ¿Puede editar `description` y `priority` mientras está `abierta`, o nunca?
3. **Hoja firmada de solicitudes:** ¿la sube solo el técnico o el admin (propuesto), o también el solicitante?
4. **`supervisor_observations`:** ¿solo la escribe el admin (propuesto)?
5. **`/uploads`:** ¿se queda público con la lista blanca (propuesto, sin cambios en el frontend) o se protege ahora? Protegerlo obliga a cambiar los `<img>`/`<a>` del frontend para usar blobs autenticados; son unos 4 componentes más.
6. **Contraseña del admin actual:** el script deja de tener `Admin123`, pero si ya se creó con esa contraseña hay que cambiarla a mano. Eso no lo puedo hacer yo.
