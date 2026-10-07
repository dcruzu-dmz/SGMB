#!/bin/bash
# Elimina los datos temporales creados por seed.sh para un SUFFIX dado.
set -e
SUFFIX="$1"
DB="postgresql://bofasa@localhost:5432/mantenimiento_db"

psql "$DB" -v ON_ERROR_STOP=1 <<SQL
DELETE FROM corrective_requests WHERE asset_id IN (SELECT id FROM assets WHERE name = 'Impresora E2E $SUFFIX');
DELETE FROM assets WHERE name = 'Impresora E2E $SUFFIX';
DELETE FROM branches WHERE name = 'Sucursal E2E $SUFFIX';
DELETE FROM users WHERE email IN ('e2e-admin-$SUFFIX@sgmb.com', 'e2e-tec-$SUFFIX@sgmb.com');
SQL
