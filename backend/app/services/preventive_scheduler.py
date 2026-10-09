import asyncio
import logging
from datetime import date, timedelta

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.branch import Branch
from app.models.maintenance_visit import MaintenanceVisit

logger = logging.getLogger("preventive_scheduler")

CHECK_INTERVAL_SECONDS = 6 * 60 * 60  # 6 horas

# Clave del candado de Postgres que serializa las corridas del chequeo entre
# procesos (varios workers de uvicorn) y con el boton manual del admin.
PREVENTIVE_CHECK_LOCK_KEY = 0x53474D42  # "SGMB"


def run_preventive_check(db: Session) -> int:
    """Crea una visita 'programada' (sin técnico asignado) para cada sucursal
    activa cuya última visita completada ya superó su frecuencia de
    mantenimiento configurada. No duplica si ya existe una visita pendiente."""
    today = date.today()
    created = 0

    branches = (
        db.query(Branch)
        .filter(Branch.maintenance_frequency_days.isnot(None))
        .filter(Branch.is_active.is_(True))
        .all()
    )

    for branch in branches:
        last_completed = (
            db.query(MaintenanceVisit)
            .filter(MaintenanceVisit.branch_id == branch.id)
            .filter(MaintenanceVisit.status == "completado")
            .order_by(MaintenanceVisit.visit_date.desc())
            .first()
        )

        due_date = (
            last_completed.visit_date + timedelta(days=branch.maintenance_frequency_days)
            if last_completed
            else today
        )

        if due_date > today:
            continue

        has_pending = (
            db.query(MaintenanceVisit)
            .filter(MaintenanceVisit.branch_id == branch.id)
            .filter(MaintenanceVisit.status.in_(["programada", "borrador"]))
            .first()
        )
        if has_pending:
            continue

        db.add(MaintenanceVisit(
            branch_id=branch.id,
            technician_id=None,
            visit_date=due_date,
            status="programada",
        ))
        created += 1

    if created:
        db.commit()

    return created


def run_preventive_check_locked(db: Session) -> int | None:
    """Corre run_preventive_check solo si ninguna otra corrida esta en curso.

    run_preventive_check pregunta si hay visita pendiente y despues la crea; dos
    corridas simultaneas podian ver "no hay" y crear dos visitas. El candado de
    transaccion de Postgres hace que solo una corra a la vez; Postgres lo libera
    al terminar la transaccion, aunque el proceso falle.

    Devuelve las visitas creadas, o None si otra corrida tenia el candado.
    """
    acquired = db.execute(
        text("SELECT pg_try_advisory_xact_lock(:key)"), {"key": PREVENTIVE_CHECK_LOCK_KEY}
    ).scalar()
    if not acquired:
        db.rollback()
        return None
    created = run_preventive_check(db)
    db.commit()  # cierra la transaccion y libera el candado (tambien si no se creo nada)
    return created


async def preventive_check_loop() -> None:
    while True:
        db = SessionLocal()
        try:
            created = run_preventive_check_locked(db)
            if created is None:
                logger.info("Preventive check: otra corrida en curso, se omite esta")
            elif created:
                logger.info("Preventive check: %s visita(s) programada(s) creada(s)", created)
        except Exception:
            logger.exception("Error en el chequeo de mantenimiento preventivo")
        finally:
            db.close()
        await asyncio.sleep(CHECK_INTERVAL_SECONDS)
