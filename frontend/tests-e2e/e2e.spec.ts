/**
 * Pruebas de Sistema (SIS) y Aceptacion (ACEP) para la documentacion 4.4.
 * Corren contra la aplicacion real (Angular en :4200 + FastAPI en :8000).
 * Requieren que SUFFIX apunte a datos ya creados con seed.sh.
 */
import { test, expect } from '@playwright/test';

const SUFFIX = process.env.E2E_SUFFIX || 'default';
const ADMIN_EMAIL = `e2e-admin-${SUFFIX}@sgmb.com`;
const TEC_EMAIL = `e2e-tec-${SUFFIX}@sgmb.com`;
const PASSWORD = 'Qatest123!';

test('SIS01 - flujo completo de login redirige al Dashboard', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('admin@sgmb.com').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  await expect(page.getByText('Panel principal del sistema SGMB')).toBeVisible();
});

test('SIS02 - crear una solicitud correctiva desde la UI aparece en el listado', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('admin@sgmb.com').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

  await page.goto('/requests');
  await page.getByRole('button', { name: '+ Nueva solicitud' }).click();
  await page.locator('select[name="asset_id"]').selectOption({ label: `Impresora E2E ${SUFFIX}` });
  await page.locator('select[name="priority"]').selectOption('media');
  await page.locator('textarea[name="description"]').fill('Prueba SIS02: no imprime correctamente');
  await page.getByRole('button', { name: 'Crear solicitud' }).click();

  await expect(page.getByText('Prueba SIS02: no imprime correctamente').or(
    page.locator('td', { hasText: `Impresora E2E ${SUFFIX}` })
  ).first()).toBeVisible({ timeout: 10000 });
});

test('ACEP01 - un tecnico completa la tarea real de cerrar su solicitud asignada', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('admin@sgmb.com').fill(TEC_EMAIL);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

  await page.goto('/requests');
  const row = page.locator('tr', { hasText: `Impresora E2E ${SUFFIX}` });
  await row.getByRole('button', { name: 'Cerrar' }).click();

  await page.locator('textarea[name="solution"]').fill('Se ajustó el sensor de papel y quedó funcionando.');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'hoja-firmada.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 contenido de prueba E2E'),
  });
  await expect(page.getByText('Ver hoja firmada')).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Actualizar' }).click();
  await expect(page.locator('tr', { hasText: `Impresora E2E ${SUFFIX}` }).getByText('Cerrada')).toBeVisible({ timeout: 10000 });
});
