// Agrupa el campo libre "tipo" de un equipo (asset.type / item.equipment_type)
// en categorias amplias para poder mostrarlos en secciones, tanto en el
// formulario/detalle de Visitas como en el modulo de Equipos.
export const EQUIPMENT_CATEGORY_ORDER = [
  'CPU', 'Monitores', 'Impresoras', 'DVR', 'Cámaras', 'Escáneres', 'Lectores de huella', 'Teclados', 'Mouse', 'UPS', 'Switch/Red', 'Otros',
];

// Nombre de tipo sugerido al crear un equipo desde la pestaña de una categoria.
export const EQUIPMENT_DEFAULT_TYPE: Record<string, string> = {
  'CPU': 'CPU Cliente',
  'Monitores': 'Monitor',
  'Impresoras': 'Impresora',
  'DVR': 'DVR',
  'Cámaras': 'Cámara',
  'Escáneres': 'Escáner de código de barra',
  'Lectores de huella': 'Lector de huella',
  'Teclados': 'Teclado',
  'Mouse': 'Mouse',
  'UPS': 'UPS',
  'Switch/Red': 'Switch',
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'CPU': ['cpu'],
  'Monitores': ['monitor'],
  'Impresoras': ['impresora'],
  'DVR': ['dvr'],
  'Cámaras': ['cámara', 'camara'],
  'Escáneres': ['escáner', 'escaner', 'scanner'],
  'Lectores de huella': ['huella', 'biométrico', 'biometrico', 'fingerprint'],
  'Teclados': ['teclado'],
  'Mouse': ['mouse'],
  'UPS': ['ups'],
  'Switch/Red': ['switch', 'router', 'red'],
};

export function equipmentCategory(type: string | null | undefined): string {
  const t = (type || '').toLowerCase();
  for (const category of EQUIPMENT_CATEGORY_ORDER) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords && keywords.some(k => t.includes(k))) return category;
  }
  return 'Otros';
}

export function isCpuType(type: string | null | undefined): boolean {
  return equipmentCategory(type) === 'CPU';
}

export function isDvrType(type: string | null | undefined): boolean {
  return equipmentCategory(type) === 'DVR';
}

export function isMonitorType(type: string | null | undefined): boolean {
  return equipmentCategory(type) === 'Monitores';
}

/** Agrupa una lista de items/assets por categoria de equipo, preservando
 * EQUIPMENT_CATEGORY_ORDER y omitiendo categorias vacias. */
export function groupByEquipmentCategory<T>(
  items: T[],
  getType: (item: T) => string | null | undefined
): { category: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const cat = equipmentCategory(getType(item));
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(item);
  }
  return EQUIPMENT_CATEGORY_ORDER
    .filter(cat => groups.has(cat))
    .map(cat => ({ category: cat, items: groups.get(cat)! }));
}
