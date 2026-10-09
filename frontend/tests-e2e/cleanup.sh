#!/bin/bash
# Elimina los datos temporales creados por seed.sh para un SUFFIX dado.
set -e
SUFFIX="$1"
# E2E_DATABASE_URL permite apuntar a otra base (el CI usa su propio Postgres)
DB="${E2E_DATABASE_URL:-postgresql://bofasa@localhost:5432/mantenimiento_db}"

psql "$DB" -v ON_ERROR_STOP=1 <<SQL
DELETE FROM corrective_requests WHERE asset_id IN (SELECT id FROM assets WHERE name = 'Impresora E2E $SUFFIX');
DELETE FROM maintenance_visit_photos WHERE item_id IN (SELECT i.id FROM maintenance_visit_items i JOIN maintenance_visits v ON v.id = i.visit_id JOIN branches b ON b.id = v.branch_id WHERE b.name = 'Sucursal E2E $SUFFIX');
DELETE FROM maintenance_visit_checklist_entries WHERE visit_id IN (SELECT v.id FROM maintenance_visits v JOIN branches b ON b.id = v.branch_id WHERE b.name = 'Sucursal E2E $SUFFIX');
DELETE FROM maintenance_visit_items WHERE visit_id IN (SELECT v.id FROM maintenance_visits v JOIN branches b ON b.id = v.branch_id WHERE b.name = 'Sucursal E2E $SUFFIX');
DELETE FROM maintenance_visits WHERE branch_id IN (SELECT id FROM branches WHERE name = 'Sucursal E2E $SUFFIX');
DELETE FROM assets WHERE name = 'Impresora E2E $SUFFIX';
DELETE FROM branches WHERE name = 'Sucursal E2E $SUFFIX';
DELETE FROM users WHERE email IN ('e2e-admin-$SUFFIX@sgmb.com', 'e2e-tec-$SUFFIX@sgmb.com');
SQL
