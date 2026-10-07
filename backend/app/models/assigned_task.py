from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class AssignedTask(Base):
    """Autorizacion temporal que un admin otorga a un tecnico para realizar
    una accion puntual (ej. actualizar inventario de equipos) en una
    sucursal. Mientras status='activa', el tecnico obtiene el permiso
    asociado a task_type; el admin la cierra cuando ya no debe seguir
    vigente. Pensado para reutilizarse con otros task_type a futuro."""

    __tablename__ = "assigned_tasks"

    id = Column(Integer, primary_key=True, index=True)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    task_type = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False, default="activa")
    notes = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)

    technician = relationship("User", foreign_keys=[technician_id])
    branch = relationship("Branch", foreign_keys=[branch_id])
    created_by = relationship("User", foreign_keys=[created_by_id])

    @property
    def technician_name(self) -> str | None:
        return self.technician.name if self.technician else None

    @property
    def branch_name(self) -> str | None:
        return self.branch.name if self.branch else None

    @property
    def created_by_name(self) -> str | None:
        return self.created_by.name if self.created_by else None
