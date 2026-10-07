#!/bin/bash
# Crea datos temporales en Postgres para las pruebas SIS/ACEP de Playwright.
# Uso: ./seed.sh <suffix>
set -e
SUFFIX="$1"
DB="postgresql://bofasa@localhost:5432/mantenimiento_db"
# hash bcrypt de "Qatest123!" (mismo para admin y tecnico)
HASH='$2b$12$JWYTipy0uJLhPSlLG2LtGOcI3UBKf.0PLQ14LE2GA3F0mRiOP3ylS'

psql "$DB" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO users (name, email, password_hash, role, is_active)
  VALUES ('E2E Admin', 'e2e-admin-$SUFFIX@sgmb.com', '$HASH', 'admin', true)
  RETURNING id \gset admin_
INSERT INTO users (name, email, password_hash, role, is_active)
  VALUES ('E2E Tecnico', 'e2e-tec-$SUFFIX@sgmb.com', '$HASH', 'tecnico', true)
  RETURNING id \gset tec_
INSERT INTO branches (name, address, phone, is_active)
  VALUES ('Sucursal E2E $SUFFIX', 'Zona 1', '12345678', true)
  RETURNING id \gset branch_
INSERT INTO assets (name, type, brand, model, serial_number, location, status, branch_id)
  VALUES ('Impresora E2E $SUFFIX', 'Impresora de Facturación', 'Epson', 'TM-T20', 'SN-$SUFFIX', 'Caja 1', 'disponible', :branch_id)
  RETURNING id \gset asset_
INSERT INTO corrective_requests (asset_id, requester_id, assigned_id, description, priority, status)
  VALUES (:asset_id, :admin_id, :tec_id, 'Impresora no corta el papel', 'alta', 'en_proceso')
  RETURNING id \gset req_
SQL

echo "ADMIN_EMAIL=e2e-admin-$SUFFIX@sgmb.com"
echo "TEC_EMAIL=e2e-tec-$SUFFIX@sgmb.com"
echo "BRANCH_ID=$(psql "$DB" -tAc "SELECT id FROM branches WHERE name='Sucursal E2E $SUFFIX'")"
echo "ASSET_ID=$(psql "$DB" -tAc "SELECT id FROM assets WHERE name='Impresora E2E $SUFFIX'")"
echo "REQUEST_ID=$(psql "$DB" -tAc "SELECT id FROM corrective_requests WHERE description='Impresora no corta el papel' AND asset_id=(SELECT id FROM assets WHERE name='Impresora E2E $SUFFIX')")"
