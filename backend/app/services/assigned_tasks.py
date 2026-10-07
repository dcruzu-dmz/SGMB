from sqlalchemy.orm import Session

from app.models.assigned_task import AssignedTask

# Tipos de tarea soportados hoy. El mecanismo es generico: a futuro se
# pueden agregar mas (ej. "editar_sucursal", "cerrar_solicitud") sin
# cambiar el modelo ni el router de AssignedTask.
TASK_TYPE_INVENTORY = "inventario_equipos"


def has_active_task(db: Session, technician_id: int, branch_id: int, task_type: str) -> bool:
    return db.query(AssignedTask).filter(
        AssignedTask.technician_id == technician_id,
        AssignedTask.branch_id == branch_id,
        AssignedTask.task_type == task_type,
        AssignedTask.status == "activa",
    ).first() is not None
