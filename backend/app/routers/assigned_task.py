from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.assigned_task import AssignedTask
from app.models.user import User
from app.schemas.assigned_task import AssignedTaskCreate, AssignedTaskResponse
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/assigned-tasks", tags=["AssignedTasks"])


@router.post("/", response_model=AssignedTaskResponse)
def create_assigned_task(
    data: AssignedTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    technician = db.query(User).filter(
        User.id == data.technician_id, User.role == "tecnico"
    ).first()
    if not technician:
        raise HTTPException(status_code=404, detail="Técnico no encontrado")

    task = AssignedTask(
        technician_id=data.technician_id,
        branch_id=data.branch_id,
        task_type=data.task_type,
        notes=data.notes,
        created_by_id=current_user.id,
        status="activa",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/", response_model=list[AssignedTaskResponse])
def get_assigned_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(AssignedTask)
    if current_user.role != "admin":
        query = query.filter(AssignedTask.technician_id == current_user.id)
    return query.order_by(AssignedTask.created_at.desc()).all()


@router.patch("/{task_id}/close", response_model=AssignedTaskResponse)
def close_assigned_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    task = db.query(AssignedTask).filter(AssignedTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    task.status = "cerrada"
    task.closed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return task
