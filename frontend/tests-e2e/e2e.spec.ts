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
// PNG valido de 1x1 (el backend valida la firma del archivo)
const PHOTO_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

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

test('VIS01 - un tecnico guarda su visita como borrador, la retoma y lo guardado persiste sin duplicarse', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('admin@sgmb.com').fill(TEC_EMAIL);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

  await page.goto('/maintenance-visits');
  const visitRow = page.locator('tr', { hasText: `Sucursal E2E ${SUFFIX}` });
  await visitRow.getByRole('link', { name: 'Completar' }).click();
  await expect(page).toHaveURL(/\/maintenance-visits\/\d+\/edit/);

  // El formulario debe cargar y responder (antes se congelaba con sucursales con equipos)
  const assetCheckbox = page.locator('.asset-pick-row-main', { hasText: `Impresora E2E ${SUFFIX}` }).locator('input[type="checkbox"]');
  await expect(assetCheckbox).toBeVisible({ timeout: 10000 });
  await assetCheckbox.check();

  const itemCard = page.locator('.item-card', { hasText: `Impresora E2E ${SUFFIX}` });
  await itemCard.getByLabel('Funciona').check();
  await itemCard.locator('input[type="file"]').setInputFiles({ name: 'equipo.png', mimeType: 'image/png', buffer: PHOTO_PNG });
  await page.locator('textarea[name="general_observations"]').fill('VIS01: limpieza general realizada');
  // El tecnico puede escribir la observacion del encargado (regresion corregida en el PR #6)
  await page.locator('textarea[name="supervisor_observations"]').fill('VIS01: encargado conforme');

  await page.getByRole('button', { name: 'Guardar como borrador' }).click();

  // Tras guardar, la app lleva al detalle de la visita: lo guardado debe verse ahi
  await expect(page).toHaveURL(/\/maintenance-visits\/\d+$/, { timeout: 10000 });
  await expect(page.getByText('Impresora de Facturación')).toBeVisible();
  await expect(page.getByText('Funciona: Sí')).toBeVisible();
  await expect(page.getByText('VIS01: limpieza general realizada')).toBeVisible();
  await expect(page.getByText('VIS01: encargado conforme')).toBeVisible();
  await expect(page.locator('img[alt="Foto del equipo"]')).toHaveCount(1);

  // Retomar el borrador: el formulario debe volver a mostrar lo guardado
  await page.getByRole('link', { name: 'Continuar visita' }).click();
  await expect(page).toHaveURL(/\/maintenance-visits\/\d+\/edit/);
  await expect(assetCheckbox).toBeChecked({ timeout: 10000 });
  await expect(itemCard.getByLabel('Funciona')).toBeChecked();
  await expect(page.locator('textarea[name="supervisor_observations"]')).toHaveValue('VIS01: encargado conforme');

  // La foto guardada se ve y se puede borrar (con confirmacion)
  const savedPhoto = itemCard.locator('img[alt="Foto guardada del equipo"]');
  await expect(savedPhoto).toHaveCount(1);
  await itemCard.getByRole('button', { name: 'Eliminar foto guardada' }).click();
  await page.locator('app-confirm-dialog').getByRole('button', { name: 'Cancelar' }).click();
  await expect(savedPhoto).toHaveCount(1);
  await itemCard.getByRole('button', { name: 'Eliminar foto guardada' }).click();
  await page.locator('app-confirm-dialog').getByRole('button', { name: 'Eliminar' }).click();
  await expect(savedPhoto).toHaveCount(0);

  // Cambiar y guardar de nuevo: se actualiza el mismo equipo, no se duplica
  await itemCard.getByLabel('Funciona').uncheck();
  await page.locator('textarea[name="general_observations"]').fill('VIS01: segunda pasada');
  await page.getByRole('button', { name: 'Guardar como borrador' }).click();
  await expect(page).toHaveURL(/\/maintenance-visits\/\d+$/, { timeout: 10000 });
  await expect(page.getByText('VIS01: segunda pasada')).toBeVisible();
  await expect(page.getByText(/Funciona: (Sí|No)/)).toHaveCount(1);
  await expect(page.getByText('Funciona: No')).toBeVisible();
  await expect(page.locator('img[alt="Foto del equipo"]')).toHaveCount(0);
});
