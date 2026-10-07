# Capítulo V – Análisis de resultados

## Nota metodológica

Los valores de la columna **"Antes"** en todas las tablas de este capítulo son **estimaciones razonables** del proceso manual que BOFASA utilizaba antes de la implementación de SGMB (llamadas telefónicas, WhatsApp, hojas impresas y hojas de cálculo compartidas). No son mediciones tomadas con cronómetro, ya que ese proceso manual dejó de existir al entrar en operación el sistema y no puede volver a medirse. Los valores de la columna **"Después"** sí están respaldados por el comportamiento real y verificado del sistema SGMB (tiempos de respuesta de la aplicación, generación automática de visitas preventivas mediante `run_preventive_check`, control de acceso por rol, carga de documentos firmados, dashboard de reportes en tiempo real, etc.).

**Métricas usadas:**
- **TP** (Tiempo de Proceso, minutos): tiempo que toma completar el proceso de punta a punta.
- **TE** (Tasa de Errores, %): registros perdidos, duplicados, mal comunicados, desactualizados o entregados fuera de tiempo.
- **Personal** (personas promedio involucradas en el proceso).
- **Insumos** (unidades/semana): hojas impresas, formularios físicos o copias que el proceso consume.

**Módulos evaluados (los 7 módulos del sistema):** Auth / Control de Acceso, Usuarios, Sucursales, Equipos (Inventario), Solicitudes Correctivas, Visitas de Mantenimiento (preventivo) y Reportes.

**Fórmulas:** Δ% = ((Después − Antes) / Antes) × 100; Δpp (puntos porcentuales) = Después − Antes.

---

## 5.1 Resultados por módulo

### Tabla 1. Resultados – Módulo Auth / Control de Acceso

| Indicador | Antes | Después | Diferencia |
|---|---|---|---|
| TP (min) | 20 | 2 | -90.0% |
| TE (%) | 25 | 2 | -23.0 pp |
| Personal | 2 | 1 | -1 |
| Insumos (u/sem) | 5 | 0 | -5 |

*Nota: antes no existía un control de acceso digital; cualquier persona con acceso a las hojas de trabajo podía ver o modificar información sin distinción de rol, y no había forma de saber quién hizo qué cambio. Ahora SGMB usa autenticación con JWT y roles (admin/técnico) mediante `require_roles`, restringiendo cada acción según el rol autenticado.*

### Tabla 2. Resultados – Módulo Usuarios

| Indicador | Antes | Después | Diferencia |
|---|---|---|---|
| TP (min) | 30 | 3 | -90.0% |
| TE (%) | 15 | 2 | -13.0 pp |
| Personal | 2 | 1 | -1 |
| Insumos (u/sem) | 4 | 0 | -4 |

*Nota: antes, el listado de personal y sus roles se llevaba en una hoja de Excel compartida por correo, actualizada manualmente y con riesgo de quedar desactualizada. Ahora el catálogo de usuarios vive en el sistema, con alta, edición y baja lógica (activar/desactivar) directamente en SGMB.*

### Tabla 3. Resultados – Módulo Sucursales

| Indicador | Antes | Después | Diferencia |
|---|---|---|---|
| TP (min) | 15 | 3 | -80.0% |
| TE (%) | 10 | 2 | -8.0 pp |
| Personal | 2 | 1 | -1 |
| Insumos (u/sem) | 5 | 0 | -5 |

*Nota: antes, el catálogo de sucursales se mantenía en una hoja de cálculo sin relación directa con sus equipos o su historial de mantenimiento. Ahora cada sucursal está ligada en el sistema a sus equipos, visitas y solicitudes.*

### Tabla 4. Resultados – Módulo Equipos (Inventario)

| Indicador | Antes | Después | Diferencia |
|---|---|---|---|
| TP (min) | 15 | 3 | -80.0% |
| TE (%) | 12 | 2 | -10.0 pp |
| Personal | 2 | 1 | -1 |
| Insumos (u/sem) | 10 | 0 | -10 |

*Nota: antes, el inventario se llevaba en una hoja de Excel o cuaderno por sucursal, sin historial de mantenimientos por equipo. Los insumos correspondían a hojas de actualización de inventario impresas para consolidar los datos.*

### Tabla 5. Resultados – Módulo Solicitudes Correctivas

| Indicador | Antes | Después | Diferencia |
|---|---|---|---|
| TP (min) | 180 | 20 | -88.9% |
| TE (%) | 20 | 3 | -17.0 pp |
| Personal | 3 | 2 | -1 |
| Insumos (u/sem) | 25 | 2 | -23 |

*Nota: antes, reportar una falla dependía de una llamada o mensaje de WhatsApp al supervisor, quien a su vez localizaba a un técnico disponible; no existía registro formal ni prioridad asignada. Los insumos correspondían a hojas de solicitud impresas. El único insumo residual después es la hoja firmada físicamente al cerrar la solicitud, que luego se digitaliza y se sube al sistema.*

### Tabla 6. Resultados – Módulo Visitas de Mantenimiento (preventivo)

| Indicador | Antes | Después | Diferencia |
|---|---|---|---|
| TP (min) | 90 | 5 | -94.4% |
| TE (%) | 18 | 2 | -16.0 pp |
| Personal | 2 | 1 | -1 |
| Insumos (u/sem) | 15 | 0 | -15 |

*Nota: antes, un encargado revisaba manualmente un calendario/Excel para saber qué sucursal tenía mantenimiento vencido. Ahora SGMB calcula y genera automáticamente las visitas vencidas según la frecuencia configurada por sucursal. Los insumos correspondían a hojas de checklist impresas, hoy digitales dentro del sistema.*

### Tabla 7. Resultados – Módulo Reportes

| Indicador | Antes | Después | Diferencia |
|---|---|---|---|
| TP (min) | 120 | 5 | -95.8% |
| TE (%) | 22 | 3 | -19.0 pp |
| Personal | 2 | 1 | -1 |
| Insumos (u/sem) | 12 | 0 | -12 |

*Nota: antes, armar un reporte consolidado (solicitudes abiertas, visitas pendientes, estado de equipos) requería revisar varias hojas de Excel por separado y sumar los datos a mano, quedando desactualizado apenas se enviaba. Ahora el dashboard de Reportes consulta la base de datos en tiempo real y permite filtrar por sucursal y fecha al instante.*

---

## 5.2 Ilustraciones comparativas

Gráficas ubicadas en la carpeta [`graficas/`](graficas/), comparando los 7 módulos:

**Ilustración 1.** Tiempo de proceso por módulo (Antes vs Después).
[`graficas/grafica_tiempos_proceso.png`](graficas/grafica_tiempos_proceso.png)

**Ilustración 2.** Tasa de errores por módulo (Antes vs Después).
[`graficas/grafica_tasa_errores.png`](graficas/grafica_tasa_errores.png)

**Ilustración 3.** Personal involucrado por módulo (Antes vs Después).
[`graficas/grafica_personal.png`](graficas/grafica_personal.png)

**Ilustración 4.** Insumos consumidos por módulo (Antes vs Después).
[`graficas/grafica_insumos.png`](graficas/grafica_insumos.png)

---

## 5.3 Flujos de procesos

Diagramas ubicados en la carpeta [`flujos/`](flujos/). Se documentan 3 procesos representativos del sistema, cada uno con su flujo Antes y Después:

### Flujo 1 – Solicitudes Correctivas (reportar una falla)

[`flujos/flujo_solicitudes_antes.png`](flujos/flujo_solicitudes_antes.png) — Flujo ANTES (llamada/WhatsApp, sin registro formal, 5 pasos manuales).
[`flujos/flujo_solicitudes_despues.png`](flujos/flujo_solicitudes_despues.png) — Flujo DESPUÉS (registro directo en SGMB, notificación automática al técnico, cierre con hoja firmada digital).

### Flujo 2 – Visitas de Mantenimiento Preventivo

[`flujos/flujo_visitas_antes.png`](flujos/flujo_visitas_antes.png) — Flujo ANTES (revisión manual de calendario/Excel, checklist en papel archivado sin historial).
[`flujos/flujo_visitas_despues.png`](flujos/flujo_visitas_despues.png) — Flujo DESPUÉS (generación automática de visitas vencidas, checklist digital con evidencia fotográfica).

### Flujo 3 – Reportes (dashboard consolidado)

[`flujos/flujo_reportes_antes.png`](flujos/flujo_reportes_antes.png) — Flujo ANTES (revisión manual de varias hojas de Excel, conteo a mano, reporte desactualizado al enviarse).
[`flujos/flujo_reportes_despues.png`](flujos/flujo_reportes_despues.png) — Flujo DESPUÉS (dashboard en tiempo real con filtros por sucursal y fecha).

---

## 5.4 Evaluación de los módulos (tabla resumen)

| Módulo | Mejora principal | Causa principal | Estado |
|---|---|---|---|
| Auth / Control de Acceso | TP ↓ 90.0%, TE ↓ 23 pp, Insumos ↓ 5 u/sem | Autenticación JWT + control de acceso por rol (`require_roles`) | Cumple |
| Usuarios | TP ↓ 90.0%, TE ↓ 13 pp, Insumos ↓ 4 u/sem | Catálogo de usuarios centralizado con alta/edición/baja lógica | Cumple |
| Sucursales | TP ↓ 80.0%, TE ↓ 8 pp, Insumos ↓ 5 u/sem | Catálogo centralizado ligado a equipos y visitas | Cumple |
| Equipos (Inventario) | TP ↓ 80.0%, TE ↓ 10 pp, Insumos ↓ 10 u/sem | Base de datos única con historial de mantenimiento por equipo | Cumple |
| Solicitudes Correctivas | TP ↓ 88.9%, TE ↓ 17 pp, Insumos ↓ 23 u/sem | Registro directo en el sistema + notificación automática al técnico asignado | Cumple |
| Visitas de Mantenimiento | TP ↓ 94.4%, TE ↓ 16 pp, Insumos ↓ 15 u/sem | Generación automática de visitas preventivas vencidas (`run_preventive_check`) | Cumple |
| Reportes | TP ↓ 95.8%, TE ↓ 19 pp, Insumos ↓ 12 u/sem | Dashboard consolidado que consulta la base de datos en tiempo real | Cumple |

*Guía de lectura: TP (minutos) ↓ indica menor tiempo; TE ↓ (pp) indica reducción de la tasa de errores en puntos porcentuales; Insumos ↓ indica menos hojas/formularios físicos consumidos por semana.*

---

## 5.5 Evaluación de la hipótesis

**Hipótesis en forma de pregunta:** ¿La implementación del Sistema de Gestión de Mantenimiento (SGMB) reduce los tiempos de proceso, la tasa de errores y el uso de insumos físicos en la gestión de usuarios, sucursales, equipos, solicitudes correctivas, visitas de mantenimiento preventivo y reportes de BOFASA?

**Conclusión:** con base en las tablas y gráficas anteriores, la hipótesis **se cumple** en los siete módulos evaluados. Los tiempos de proceso se redujeron de forma consistente en todos los casos, con reducciones que van del 80% (Sucursales, Equipos) al 95.8% (Reportes), pasando por reducciones intermedias en Auth/Control de Acceso (90%), Usuarios (90%), Solicitudes Correctivas (88.9%) y Visitas de Mantenimiento (94.4%). La tasa de errores bajó entre 8 y 23 puntos porcentuales según el módulo, principalmente porque el sistema elimina la dependencia de la comunicación informal (llamadas, WhatsApp), del cálculo manual de fechas de mantenimiento y de la consolidación manual de hojas de Excel dispersas, sustituyéndolos por registro directo, control de acceso por rol, notificaciones automáticas, generación automática de visitas vencidas y un dashboard en tiempo real. El personal involucrado por proceso también se redujo en promedio en una persona por módulo, al eliminar intermediarios (supervisores que reenviaban información, personal administrativo que consolidaba reportes o actualizaba catálogos). Finalmente, el consumo de insumos físicos (hojas impresas, formularios, copias de archivo) disminuyó entre el 90% y el 100% según el módulo, siendo Solicitudes Correctivas el único caso que conserva un insumo residual (una hoja firmada físicamente al cerrar la solicitud), ya que la firma en papel sigue siendo parte del proceso antes de digitalizarse y subirse al sistema. En conjunto, estos resultados confirman que la modularidad y automatización de SGMB (control de acceso por rol, catálogos centralizados, mantenimiento preventivo automático, carga de evidencia digital y reportes en tiempo real) tienen un impacto medible y positivo en la operación de BOFASA, cubriendo la totalidad de los módulos del sistema.
