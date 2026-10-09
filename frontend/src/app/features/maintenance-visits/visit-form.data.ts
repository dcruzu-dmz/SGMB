// Datos fijos del formulario de visitas: tipos de equipo, motivos y plantillas
// de checklist. Son datos, no comportamiento; se separan del componente.
import {
  MaintenanceVisitChecklistEntryCreate,
  MaintenanceVisitItemCreate,
  MaintenanceVisitPhoto,
} from '../../core/services/maintenance-visit.service';

export interface DraftItem extends MaintenanceVisitItemCreate {
  _files: File[];
  _previews: string[];
  _savedPhotos: MaintenanceVisitPhoto[];  // fotos ya guardadas (al retomar un borrador)
}

export interface ChecklistGroup {
  category: string;
  title: string;
  entries: MaintenanceVisitChecklistEntryCreate[];
}

export const EQUIPMENT_TYPES = [
  'CPU Servidor', 'CPU Cliente', 'Monitor', 'Teclado', 'Mouse', 'UPS',
  'DVR', 'Escáner de código de barra', 'Switch',
  'Impresora Multifuncional', 'Impresora de Facturación', 'Impresora Xerox', 'Otro',
];

export const VISIT_REASONS = [
  'Mantenimiento Técnico', 'Mantenimiento Lógico', 'DVR', 'Cámaras', 'Enlace',
  'Red', 'Switch', 'Cambio', 'Instalación', 'Configuración', 'Reparación', 'Otros',
];

export const CHECKLIST_TEMPLATE: ChecklistGroup[] = [
  {
    category: 'revision', title: 'Revisión', entries: [
      'DVR y cámaras', 'IP/DNS de servidor y de cada cliente',
      'Tareas programadas', 'Usuario administrador habilitado',
    ].map(label => ({ category: 'revision', label, checked: false })),
  },
  {
    category: 'compartido', title: 'Recursos compartidos', entries: [
      'Carpeta de documentos compartidos (origen: servidor)', 'Carpeta utilitarios',
      'Carpeta links', 'Impresora Xerox', 'Impresora Epson',
    ].map(label => ({ category: 'compartido', label, checked: false })),
  },
];

export const CPU_TYPES = ['CPU Servidor', 'CPU Cliente'];

const SOFTWARE_CHECKLIST_ITEMS = [
  'Sistema de punto de venta', 'Servicio de impresión', '7-Zip',
  'ESET Antivirus (actualizado)', 'Mozilla Firefox', 'Google Chrome',
  'TightVNC / VNC', 'OpenOffice',
  'Zimbra Desktop (revisar cuota de correo)',
  'Movimientos de inventario (acceso directo)', 'Pedidos emergentes',
  'Artículos (acceso directo)', 'Actualiza maestros (acceso directo)',
];

const CPU_CLEANING_ITEMS = [
  'Case', 'Uso de sopladora', 'Limpieza de motherboard',
  'Lubricación de partes móviles', 'Encender el equipo y verificar que inicie correctamente el sistema operativo',
];

const PRINTER_CLEANING_ITEMS = [
  'Limpieza externa', 'Limpieza y lubricación de partes móviles', 'Limpieza de rodillos', 'Prueba de impresión',
];

const CLEANING_CHECKLISTS: Record<string, string[]> = {
  'CPU Servidor': CPU_CLEANING_ITEMS,
  'CPU Cliente': CPU_CLEANING_ITEMS,
  'Monitor': ['Limpieza de pantalla', 'Limpieza de carcasa', 'Verificar cables de video y de poder', 'Encender y verificar que muestre imagen correctamente'],
  'Teclado': ['Limpieza de teclas', 'Uso de sopladora entre teclas', 'Verificar que todas las teclas respondan'],
  'Mouse': ['Limpieza de carcasa y sensor', 'Verificar funcionamiento de botones y scroll'],
  'UPS': ['Limpieza externa', 'Verificar batería / autonomía', 'Verificar conexiones y cableado'],
  'DVR': ['Limpieza externa', 'Verificar grabación correcta', 'Verificar fecha y hora del sistema', 'Verificar espacio en disco duro'],
  'Cámaras': ['Limpieza de lente', 'Verificar enfoque e imagen', 'Verificar conexión y cableado'],
  'Escáner de código de barra': ['Limpieza de lente/cristal', 'Verificar lectura correcta de códigos'],
  'Switch': ['Limpieza externa', 'Verificar luces y puertos activos', 'Verificar cableado de red'],
  'Impresora Multifuncional': PRINTER_CLEANING_ITEMS,
  'Impresora de Facturación': PRINTER_CLEANING_ITEMS,
  'Impresora Xerox': PRINTER_CLEANING_ITEMS,
};

export function buildChecklistForType(type: string): MaintenanceVisitChecklistEntryCreate[] {
  const cleaning = (CLEANING_CHECKLISTS[type] || [])
    .map(label => ({ category: 'limpieza', label, checked: false, comment: '' }));
  const software = CPU_TYPES.includes(type)
    ? SOFTWARE_CHECKLIST_ITEMS.map(label => ({ category: 'software', label, checked: false, comment: '' }))
    : [];
  return [...cleaning, ...software];
}
