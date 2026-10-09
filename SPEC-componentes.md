# Spec: dividir los componentes grandes (auditoría, punto 23)

## Objetivo

El punto 23 marcaba `visit-form` y `assets-list` como componentes grandes. Un refactor solo vale la pena si **reduce lo que hay que entender o mantener**, no si solo mueve código. Se midió antes de decidir (2026-10-09):

| Componente | TS | HTML | Total |
|---|---|---|---|
| `visit-form` | 586 | 376 | **962** |
| `assets-list` | 428 | 295 | 723 |
| `reports-dashboard` | 250 | 286 | 536 |
| `corrective-requests-list` | 330 | 172 | 502 |

### `visit-form`: sí, con dos problemas concretos

1. **La ficha de un equipo está duplicada.** El bloque de un equipo (Instalado / Funciona / Limpieza, checklist de limpieza y de software, observaciones, fotos guardadas y nuevas) existe **dos veces en el HTML**: una para los equipos de la sucursal y otra para los equipos no registrados. Las dos versiones comparten ~26 líneas casi idénticas y se diferencian solo en los nombres de los campos (`'-a' + asset.id` frente a `'-' + i`). **El costo ya se vio:** en el PR #19 y en el #20 cada cambio de fotos hubo que aplicarlo dos veces, y es fácil que una copia quede desactualizada.
2. **~70 líneas de datos estáticos dentro del componente:** tipos de equipo, motivos de visita, plantillas de checklist general, de limpieza por tipo de equipo y de software. Son datos, no comportamiento, y hacen que la lógica real del formulario empiece en la línea ~100.

### `assets-list`: no por ahora

Es grande pero **cohesivo**: un listado con filtros y dos modales (formulario y detalle) que trabajan sobre el mismo estado. No se encontró duplicación con costo demostrado. Dividirlo movería código sin quitar conceptos. Se revisaría si crece o si un cambio futuro obliga a tocar lo mismo en dos lugares.

## Alcance

1. **Extraer `VisitItemCardComponent`** (`maintenance-visits/components/visit-item-card/`): el cuerpo común de la ficha de un equipo. Lo usan las dos listas de equipos de `visit-form`.
   - Entradas: `item` (el equipo en edición) y `fieldKey` (sufijo único para los nombres de los campos, como hoy).
   - Salidas: `photosSelected`, `removeNewPhoto`, `removeSavedPhoto`. La lógica (subir y borrar fotos, confirmación) **se queda en `visit-form`**: la ficha solo muestra y avisa.
   - Lo que difiere entre las dos listas se queda en `visit-form`: el encabezado de la ficha de un equipo de la sucursal, y el selector de tipo, la ubicación, la serie y el botón "Quitar" de un equipo manual.
2. **Mover los datos estáticos** a `maintenance-visits/visit-form.data.ts` (constantes y `buildChecklistForType`). Sin cambios de valores.
3. **Sin cambios de comportamiento**: misma pantalla, mismos nombres de campos y mismas llamadas a la API.

## Comandos

```
Build:  cd frontend && npx ng build
E2E:    frontend/tests-e2e/seed.sh <s> && E2E_SUFFIX=<s> npx playwright test -c tests-e2e/playwright.config.ts && cleanup.sh <s>
CI:     el PR corre backend, build y e2e
```

## Estructura y archivos afectados

| Archivo | Cambio |
|---|---|
| `features/maintenance-visits/components/visit-item-card/visit-item-card.component.{ts,html,css}` (nuevo) | Cuerpo común de la ficha de un equipo |
| `features/maintenance-visits/visit-form.data.ts` (nuevo) | Constantes y plantillas de checklist |
| `features/maintenance-visits/pages/visit-form/visit-form.component.{ts,html,css}` | Usa la ficha y los datos; se van el bloque duplicado y las constantes |

## Estilo

Se siguen los componentes standalone existentes (como `EquipmentIconComponent`): `@Input()` y `@Output()` con `EventEmitter`, estilos propios, y nada de lógica de API dentro de la ficha.

## Verificación

- **VIS01** (e2e) cubre la ficha de punta a punta: marcar un equipo, "Funciona", subir una foto, retomar el borrador, ver y borrar la foto guardada, y guardar sin duplicar. Tiene que seguir pasando **sin modificar el test**.
- **Equipos no registrados** (la segunda lista): prueba adicional en vivo, porque VIS01 no la cubre. Agregar un equipo manual, marcar su checklist, guardar y retomar.
- **Build de producción** sin errores. Comparar el número de líneas antes y después.
- **CI** en verde (backend, build y e2e).

## Criterios de éxito

- La ficha de un equipo existe en **un solo lugar**: un cambio en ella se hace una vez.
- `visit-form` pierde el bloque duplicado y las ~70 líneas de datos.
- VIS01 pasa sin cambios y los equipos manuales funcionan igual.

## Límites

- **Siempre:** refactor puro, sin cambios de comportamiento ni de API; VIS01 sin modificar.
- **Preguntar antes:** tocar `assets-list` u otros componentes, o cambiar la lógica de guardado.
- **Nunca:** mezclar en este cambio arreglos o funciones nuevas.

## Decisiones

1. **`assets-list`:** se extrae también su ventana de detalle (`AssetDetailModalComponent`).
2. **Equipos no registrados:** se agrega el e2e permanente VIS02. También AST01 para la ventana de detalle de equipos, que no tenía ningún test.

## Resultado (implementado)

- **Línea base primero:** VIS02 y AST01 se escribieron y pasaron con el código original, antes de tocarlo. `e2e.spec.ts` no se modificó durante el refactor.
- **Sin cambios visuales:** capturas de las dos fichas y de la ventana de detalle, antes y después, en escritorio (1280 px) y en celular (375 px): **0 píxeles distintos** en las 6 comparaciones.
- **6 e2e** pasan; build de producción OK.

| Archivo | Antes | Ahora |
|---|---|---|
| `visit-form.component.ts` | 586 | 508 |
| `visit-form.component.html` | 376 | 280 |
| `visit-form.component.css` | 438 | 388 |
| `visit-form.data.ts` (nuevo) | — | 90 |
| `visit-item-card` ts / html / css (nuevo) | — | 39 / 49 / 157 |
| `assets-list.component.html` | 295 | 237 |
| `assets-list.component.css` | 437 | 370 |
| `asset-detail-modal` ts / html / css (nuevo) | — | 29 / 65 / 151 |

**Lo que se ganó:** la ficha de un equipo existe en un solo lugar (antes, dos copias de ~50 líneas), los datos fijos están separados de la lógica y la ventana de detalle es un componente propio.

**Lo que costó:** el CSS total creció. Los estilos de Angular están encapsulados por componente, así que las reglas compartidas (campos, chips, ventana modal) se copiaron en los componentes nuevos. Esa duplicación ya existía en el proyecto: las reglas de ventana modal están en 8 componentes y `form-group` en 10. La solución de fondo es una hoja de estilos compartida (mejora aparte).

**Código sin uso detectado, no tocado (fuera de alcance):** `isCpuType` y la importación de `CPU_TYPES` en `visit-form.component.ts` ya no se usaban antes de este cambio, y duplican `isCpuType` de `core/utils/equipment-category.ts`.
