"""alinea esquema con modelos

Corrige las diferencias entre la base existente (0001) y los modelos:
textos mas largos, NOT NULL donde el modelo lo exige, indice unico en
users.email, indices de id y fechas con zona horaria. Los datos no cambian:
antes de aplicarla se verifico que no hay nulos ni correos duplicados.

Las columnas TIMESTAMP guardaban la hora local del servidor, por eso se
convierten interpretandolas en LOCAL_TZ (y al revertir, de vuelta a esa hora).

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-07 12:57:04.573632

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0002'
down_revision: Union[str, Sequence[str], None] = '0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Zona horaria en la que se guardaron las fechas sin zona (TimeZone del servidor Postgres)
LOCAL_TZ = "America/Guatemala"


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('assets', 'name',
               existing_type=sa.VARCHAR(length=100),
               type_=sa.String(length=150),
               nullable=False)
    op.alter_column('assets', 'type',
               existing_type=sa.VARCHAR(length=50),
               nullable=False)
    op.alter_column('assets', 'brand',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.String(length=100),
               existing_nullable=True)
    op.alter_column('assets', 'model',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.String(length=100),
               existing_nullable=True)
    op.alter_column('assets', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               existing_server_default=sa.text('now()'),
               postgresql_using=f"created_at AT TIME ZONE '{LOCAL_TZ}'")
    op.create_index(op.f('ix_assets_id'), 'assets', ['id'], unique=False)
    op.alter_column('branches', 'name',
               existing_type=sa.VARCHAR(length=100),
               type_=sa.String(length=150),
               nullable=False)
    op.alter_column('branches', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               existing_server_default=sa.text('now()'),
               postgresql_using=f"created_at AT TIME ZONE '{LOCAL_TZ}'")
    op.create_index(op.f('ix_branches_id'), 'branches', ['id'], unique=False)
    op.alter_column('corrective_requests', 'asset_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('corrective_requests', 'requester_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('corrective_requests', 'description',
               existing_type=sa.TEXT(),
               nullable=False)
    op.alter_column('corrective_requests', 'priority',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.String(length=50),
               nullable=False)
    op.alter_column('corrective_requests', 'status',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.String(length=50),
               existing_nullable=True)
    op.alter_column('corrective_requests', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               existing_server_default=sa.text('now()'),
               postgresql_using=f"created_at AT TIME ZONE '{LOCAL_TZ}'")
    op.alter_column('corrective_requests', 'closed_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               postgresql_using=f"closed_at AT TIME ZONE '{LOCAL_TZ}'")
    op.create_index(op.f('ix_corrective_requests_id'), 'corrective_requests', ['id'], unique=False)
    op.alter_column('users', 'name',
               existing_type=sa.VARCHAR(length=100),
               type_=sa.String(length=150),
               nullable=False)
    op.alter_column('users', 'email',
               existing_type=sa.VARCHAR(length=100),
               type_=sa.String(length=150),
               nullable=False)
    op.alter_column('users', 'password_hash',
               existing_type=sa.TEXT(),
               type_=sa.String(length=255),
               nullable=False)
    op.alter_column('users', 'role',
               existing_type=sa.VARCHAR(length=50),
               nullable=False)
    op.alter_column('users', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               existing_server_default=sa.text('now()'),
               postgresql_using=f"created_at AT TIME ZONE '{LOCAL_TZ}'")
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.alter_column('users', 'created_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('now()'),
               postgresql_using=f"created_at AT TIME ZONE '{LOCAL_TZ}'")
    op.alter_column('users', 'role',
               existing_type=sa.VARCHAR(length=50),
               nullable=True)
    op.alter_column('users', 'password_hash',
               existing_type=sa.String(length=255),
               type_=sa.TEXT(),
               nullable=True)
    op.alter_column('users', 'email',
               existing_type=sa.String(length=150),
               type_=sa.VARCHAR(length=100),
               nullable=True)
    op.alter_column('users', 'name',
               existing_type=sa.String(length=150),
               type_=sa.VARCHAR(length=100),
               nullable=True)
    op.drop_index(op.f('ix_corrective_requests_id'), table_name='corrective_requests')
    op.alter_column('corrective_requests', 'closed_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True,
               postgresql_using=f"closed_at AT TIME ZONE '{LOCAL_TZ}'")
    op.alter_column('corrective_requests', 'created_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('now()'),
               postgresql_using=f"created_at AT TIME ZONE '{LOCAL_TZ}'")
    op.alter_column('corrective_requests', 'status',
               existing_type=sa.String(length=50),
               type_=sa.VARCHAR(length=20),
               existing_nullable=True)
    op.alter_column('corrective_requests', 'priority',
               existing_type=sa.String(length=50),
               type_=sa.VARCHAR(length=20),
               nullable=True)
    op.alter_column('corrective_requests', 'description',
               existing_type=sa.TEXT(),
               nullable=True)
    op.alter_column('corrective_requests', 'requester_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.alter_column('corrective_requests', 'asset_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_index(op.f('ix_branches_id'), table_name='branches')
    op.alter_column('branches', 'created_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('now()'),
               postgresql_using=f"created_at AT TIME ZONE '{LOCAL_TZ}'")
    op.alter_column('branches', 'name',
               existing_type=sa.String(length=150),
               type_=sa.VARCHAR(length=100),
               nullable=True)
    op.drop_index(op.f('ix_assets_id'), table_name='assets')
    op.alter_column('assets', 'created_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('now()'),
               postgresql_using=f"created_at AT TIME ZONE '{LOCAL_TZ}'")
    op.alter_column('assets', 'model',
               existing_type=sa.String(length=100),
               type_=sa.VARCHAR(length=50),
               existing_nullable=True)
    op.alter_column('assets', 'brand',
               existing_type=sa.String(length=100),
               type_=sa.VARCHAR(length=50),
               existing_nullable=True)
    op.alter_column('assets', 'type',
               existing_type=sa.VARCHAR(length=50),
               nullable=True)
    op.alter_column('assets', 'name',
               existing_type=sa.String(length=150),
               type_=sa.VARCHAR(length=100),
               nullable=True)
