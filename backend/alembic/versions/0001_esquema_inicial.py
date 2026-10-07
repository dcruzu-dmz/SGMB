"""esquema inicial

Esquema de mantenimiento_db tal como existia al adoptar Alembic (2026-10-07),
generado leyendo la base real. En la base existente solo se marca con
`alembic stamp 0001`; en una base nueva crea las tablas desde cero. Las
diferencias con los modelos se corrigen en 0002.

Revision ID: 0001
Revises: 
Create Date: 2026-10-07 12:56:50.715839

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('branches',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('address', sa.VARCHAR(length=200), autoincrement=False, nullable=True),
    sa.Column('phone', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.Column('maintenance_frequency_days', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('chain', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='branches_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_table('users',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('email', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('password_hash', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('role', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='users_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_table('assets',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('type', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('brand', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('model', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('serial_number', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('location', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('status', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.Column('branch_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('ram', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('storage', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('processor', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('operating_system', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('channels', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('screen_size', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('video_port', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['branch_id'], ['branches.id'], name='assets_branch_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='assets_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_table('assigned_tasks',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('technician_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('branch_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('task_type', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('status', sa.VARCHAR(length=20), autoincrement=False, nullable=False),
    sa.Column('notes', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('created_by_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.Column('closed_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['branch_id'], ['branches.id'], name='assigned_tasks_branch_id_fkey'),
    sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], name='assigned_tasks_created_by_id_fkey'),
    sa.ForeignKeyConstraint(['technician_id'], ['users.id'], name='assigned_tasks_technician_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='assigned_tasks_pkey')
    )
    op.create_index('ix_assigned_tasks_id', 'assigned_tasks', ['id'], unique=False, postgresql_include=[])
    op.create_table('maintenance_visits',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('branch_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('technician_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('visit_date', sa.DATE(), autoincrement=False, nullable=False),
    sa.Column('entry_time', postgresql.TIME(), autoincrement=False, nullable=True),
    sa.Column('exit_time', postgresql.TIME(), autoincrement=False, nullable=True),
    sa.Column('visit_reasons', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('equipment_count', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('thermal_printers_count', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('matrix_printers_count', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('branch_contact_name', sa.VARCHAR(length=150), autoincrement=False, nullable=True),
    sa.Column('branch_contact_employee_code', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('camera_review_by', sa.VARCHAR(length=150), autoincrement=False, nullable=True),
    sa.Column('camera_review_time', postgresql.TIME(), autoincrement=False, nullable=True),
    sa.Column('equipment_change_previous_serial', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('equipment_change_previous_brand', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('equipment_change_new_serial', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('equipment_change_new_brand', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('delivered_equipment', sa.VARCHAR(length=150), autoincrement=False, nullable=True),
    sa.Column('delivered_brand', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('delivered_serial', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('delivered_model', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('general_observations', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('supervisor_observations', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('status', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.Column('signed_report_path', sa.VARCHAR(length=300), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['branch_id'], ['branches.id'], name='maintenance_visits_branch_id_fkey'),
    sa.ForeignKeyConstraint(['technician_id'], ['users.id'], name='maintenance_visits_technician_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='maintenance_visits_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_index('ix_maintenance_visits_id', 'maintenance_visits', ['id'], unique=False, postgresql_include=[])
    op.create_table('corrective_requests',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('asset_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('requester_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('assigned_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('priority', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.Column('status', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.Column('solution', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.Column('closed_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column('signed_report_path', sa.VARCHAR(length=300), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['asset_id'], ['assets.id'], name='corrective_requests_asset_id_fkey'),
    sa.ForeignKeyConstraint(['assigned_id'], ['users.id'], name='corrective_requests_assigned_technician_id_fkey'),
    sa.ForeignKeyConstraint(['requester_id'], ['users.id'], name='corrective_requests_requester_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='corrective_requests_pkey')
    )
    op.create_table('maintenance_visit_items',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('visit_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('asset_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('equipment_type', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('identification_location', sa.VARCHAR(length=150), autoincrement=False, nullable=True),
    sa.Column('serial', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('installed', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('working', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('cleaning_done', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('notes', sa.TEXT(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['asset_id'], ['assets.id'], name='maintenance_visit_items_asset_id_fkey'),
    sa.ForeignKeyConstraint(['visit_id'], ['maintenance_visits.id'], name='maintenance_visit_items_visit_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='maintenance_visit_items_pkey')
    )
    op.create_index('ix_maintenance_visit_items_id', 'maintenance_visit_items', ['id'], unique=False, postgresql_include=[])
    op.create_table('maintenance_visit_checklist_entries',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('visit_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('category', sa.VARCHAR(length=30), autoincrement=False, nullable=False),
    sa.Column('label', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('checked', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('comment', sa.VARCHAR(length=200), autoincrement=False, nullable=True),
    sa.Column('item_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['item_id'], ['maintenance_visit_items.id'], name='maintenance_visit_checklist_entries_item_id_fkey'),
    sa.ForeignKeyConstraint(['visit_id'], ['maintenance_visits.id'], name='maintenance_visit_checklist_entries_visit_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='maintenance_visit_checklist_entries_pkey')
    )
    op.create_index('ix_maintenance_visit_checklist_entries_id', 'maintenance_visit_checklist_entries', ['id'], unique=False, postgresql_include=[])
    op.create_table('maintenance_visit_photos',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('item_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('file_path', sa.VARCHAR(length=300), autoincrement=False, nullable=False),
    sa.Column('uploaded_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['item_id'], ['maintenance_visit_items.id'], name='maintenance_visit_photos_item_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='maintenance_visit_photos_pkey')
    )
    op.create_index('ix_maintenance_visit_photos_id', 'maintenance_visit_photos', ['id'], unique=False, postgresql_include=[])


def downgrade() -> None:
    op.drop_index('ix_maintenance_visit_photos_id', table_name='maintenance_visit_photos', postgresql_include=[])
    op.drop_table('maintenance_visit_photos')
    op.drop_index('ix_maintenance_visit_checklist_entries_id', table_name='maintenance_visit_checklist_entries', postgresql_include=[])
    op.drop_table('maintenance_visit_checklist_entries')
    op.drop_index('ix_maintenance_visit_items_id', table_name='maintenance_visit_items', postgresql_include=[])
    op.drop_table('maintenance_visit_items')
    op.drop_table('corrective_requests')
    op.drop_index('ix_maintenance_visits_id', table_name='maintenance_visits', postgresql_include=[])
    op.drop_table('maintenance_visits')
    op.drop_index('ix_assigned_tasks_id', table_name='assigned_tasks', postgresql_include=[])
    op.drop_table('assigned_tasks')
    op.drop_table('assets')
    op.drop_table('users')
    op.drop_table('branches')
