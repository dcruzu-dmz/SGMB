import { EquipmentIconComponent } from '../../../../shared/equipment-icon/equipment-icon.component';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { UsersService, User } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AssetsService, Asset } from '../../../../core/services/assets.service';
import {
  MaintenanceVisit,
  MaintenanceVisitService,
  MaintenanceVisitItemCreate,
  MaintenanceVisitChecklistEntryCreate,
  MaintenanceVisitPhoto,
} from '../../../../core/services/maintenance-visit.service';
import { ToastService } from '../../../../core/services/toast.service';
import { groupByEquipmentCategory } from '../../../../core/utils/equipment-category';

interface DraftItem extends MaintenanceVisitItemCreate {
  _files: File[];
  _previews: string[];
  _savedPhotos: MaintenanceVisitPhoto[];  // fotos ya guardadas (al retomar un borrador)
}

interface ChecklistGroup {
  category: string;
  title: string;
  entries: MaintenanceVisitChecklistEntryCreate[];
}

const EQUIPMENT_TYPES = [
  'CPU Servidor', 'CPU Cliente', 'Monitor', 'Teclado', 'Mouse', 'UPS',
  'DVR', 'Escáner de código de barra', 'Switch',
  'Impresora Multifuncional', 'Impresora de Facturación', 'Impresora Xerox', 'Otro',
];

const VISIT_REASONS = [
  'Mantenimiento Técnico', 'Mantenimiento Lógico', 'DVR', 'Cámaras', 'Enlace',
  'Red', 'Switch', 'Cambio', 'Instalación', 'Configuración', 'Reparación', 'Otros',
];

const CHECKLIST_TEMPLATE: ChecklistGroup[] = [
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

const CPU_TYPES = ['CPU Servidor', 'CPU Cliente'];

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

function buildChecklistForType(type: string): MaintenanceVisitChecklistEntryCreate[] {
  const cleaning = (CLEANING_CHECKLISTS[type] || [])
    .map(label => ({ category: 'limpieza', label, checked: false, comment: '' }));
  const software = CPU_TYPES.includes(type)
    ? SOFTWARE_CHECKLIST_ITEMS.map(label => ({ category: 'software', label, checked: false, comment: '' }))
    : [];
  return [...cleaning, ...software];
}

@Component({
  selector: 'app-visit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EquipmentIconComponent],
  templateUrl: './visit-form.component.html',
  styleUrl: './visit-form.component.css',
})
export class VisitFormComponent implements OnInit {
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private assetsService = inject(AssetsService);
  private visitService = inject(MaintenanceVisitService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  branches: Branch[] = [];
  technicians: User[] = [];
  allAssets: Asset[] = [];
  equipmentTypes = EQUIPMENT_TYPES;
  visitReasons = VISIT_REASONS;

  visitId: number | null = null;
  isCompleting = false;

  loading = false;
  isAdmin = false;
  errorMessage = '';
  signedReportPath: string | null = null;
  uploadingReport = false;
  reportErrorMessage = '';

  header = {
    branch_id: 0,
    technician_id: null as number | null,
    visit_date: new Date().toISOString().slice(0, 10),
    entry_time: '',
    exit_time: '',
    equipment_count: null as number | null,
    thermal_printers_count: null as number | null,
    matrix_printers_count: null as number | null,
    branch_contact_name: '',
    branch_contact_employee_code: '',
    camera_review_by: '',
    camera_review_time: '',
    equipment_change_previous_serial: '',
    equipment_change_previous_brand: '',
    equipment_change_new_serial: '',
    equipment_change_new_brand: '',
    delivered_equipment: '',
    delivered_brand: '',
    delivered_serial: '',
    delivered_model: '',
    general_observations: '',
    supervisor_observations: '',
  };

  selectedReasons: Record<string, boolean> = {};
  selectedAssetIds: Record<number, boolean> = {};
  assetObservations: Record<number, string> = {};
  // id del equipo guardado como "no atendido, con observacion", por asset_id (al retomar un borrador)
  flaggedItemIds: Record<number, number> = {};
  items: DraftItem[] = [];
  checklistGroups: ChecklistGroup[] = CHECKLIST_TEMPLATE.map(g => ({
    ...g,
    entries: g.entries.map(e => ({ ...e })),
  }));

  get branchAssets(): Asset[] {
    if (!this.header.branch_id) return [];
    return this.allAssets.filter(a => a.branch_id === this.header.branch_id);
  }

  get groupedBranchAssets(): { category: string; items: Asset[] }[] {
    return groupByEquipmentCategory(this.branchAssets, a => a.type);
  }

  /** Equipos activos de la sucursal que todavía no fueron marcados como
   * atendidos ni justificados con una observación. Los equipos dados de
   * baja no se exigen porque ya no están en operación. */
  get pendingAssets(): Asset[] {
    return this.branchAssets.filter(a =>
      a.status !== 'dado_de_baja' &&
      !this.selectedAssetIds[a.id] &&
      !(this.assetObservations[a.id] || '').trim()
    );
  }

  /** Razón por la que "Finalizar visita" está deshabilitado, o cadena
   * vacía si ya se puede finalizar. */
  get finalizeBlockedReason(): string {
    if (!this.signedReportPath) return 'Sube la hoja firmada antes de finalizar';
    if (this.pendingAssets.length > 0) {
      return `Marca o justifica ${this.pendingAssets.length} equipo(s) antes de finalizar`;
    }
    return '';
  }

  get manualItems(): DraftItem[] {
    return this.items.filter(i => !i.asset_id);
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.visitId = idParam ? Number(idParam) : null;
    this.isCompleting = !!this.visitId;
    this.authService.getMe().subscribe({ next: user => this.isAdmin = user.role === 'admin' });

    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
    this.assetsService.getAssets().subscribe({ next: res => this.allAssets = res });
    this.usersService.getUsers().subscribe({
      next: res => this.technicians = res.filter(u => u.role === 'tecnico' || u.role === 'admin'),
    });

    if (this.visitId) {
      this.visitService.getVisit(this.visitId).subscribe({
        next: visit => {
          this.header.branch_id = visit.branch_id;
          this.header.technician_id = visit.technician_id;
          this.header.visit_date = visit.visit_date;
          this.header.entry_time = visit.entry_time || '';
          this.header.exit_time = visit.exit_time || '';
          this.header.equipment_count = visit.equipment_count;
          this.header.thermal_printers_count = visit.thermal_printers_count;
          this.header.matrix_printers_count = visit.matrix_printers_count;
          this.header.branch_contact_name = visit.branch_contact_name || '';
          this.header.branch_contact_employee_code = visit.branch_contact_employee_code || '';
          this.header.camera_review_by = visit.camera_review_by || '';
          this.header.camera_review_time = visit.camera_review_time || '';
          this.header.general_observations = visit.general_observations || '';
          this.header.supervisor_observations = visit.supervisor_observations || '';
          this.signedReportPath = visit.signed_report_path;
          this.restoreSavedWork(visit);

          if (visit.visit_reasons) {
            try {
              const reasons: string[] = JSON.parse(visit.visit_reasons);
              reasons.forEach(r => this.selectedReasons[r] = true);
            } catch { /* ignore malformed data */ }
          }
        },
      });
    } else {
      this.authService.getMe().subscribe({
        next: user => this.header.technician_id = user.id,
      });
    }
  }

  /** Al retomar un borrador, vuelve a cargar en el formulario lo ya guardado:
   * equipos atendidos (con su checklist y fotos), equipos no atendidos con su
   * observacion y el checklist general. Guardan su id para que el guardado los
   * actualice en vez de duplicarlos. */
  private restoreSavedWork(visit: MaintenanceVisit): void {
    for (const item of visit.items) {
      const flagged = item.asset_id !== null && item.installed === null && item.working === null
        && item.cleaning_done === null && item.checklist_entries.length === 0;
      if (flagged) {
        this.assetObservations[item.asset_id!] = item.notes || '';
        this.flaggedItemIds[item.asset_id!] = item.id;
        continue;
      }
      this.items.push({
        id: item.id,
        asset_id: item.asset_id,
        equipment_type: item.equipment_type,
        identification_location: item.identification_location,
        serial: item.serial,
        installed: item.installed,
        working: item.working,
        cleaning_done: item.cleaning_done,
        notes: item.notes || '',
        checklist_entries: item.checklist_entries.map(e => ({
          id: e.id, category: e.category, label: e.label, checked: e.checked, comment: e.comment || '',
        })),
        _files: [],
        _previews: [],
        _savedPhotos: item.photos,
      });
      if (item.asset_id) this.selectedAssetIds[item.asset_id] = true;
    }

    const general = visit.checklist_entries.filter(e => e.item_id === null);
    for (const group of this.checklistGroups) {
      for (const entry of group.entries) {
        const saved = general.find(e => e.category === entry.category && e.label === entry.label);
        if (saved) {
          entry.id = saved.id;
          entry.checked = saved.checked;
          entry.comment = saved.comment;
        }
      }
    }
  }

  isCpuType(type: string): boolean {
    return CPU_TYPES.includes(type);
  }

  entriesByCategory(item: DraftItem, category: string): MaintenanceVisitChecklistEntryCreate[] {
    return (item.checklist_entries || []).filter(e => e.category === category);
  }

  toggleAsset(asset: Asset): void {
    const checked = !this.selectedAssetIds[asset.id];
    this.selectedAssetIds[asset.id] = checked;

    if (checked) {
      this.items.push({
        asset_id: asset.id,
        equipment_type: asset.type,
        identification_location: asset.location || asset.name,
        serial: asset.serial_number,
        installed: true,
        working: true,
        cleaning_done: true,
        notes: '',
        checklist_entries: buildChecklistForType(asset.type),
        _files: [],
        _previews: [],
        _savedPhotos: [],
      });
    } else {
      const idx = this.items.findIndex(i => i.asset_id === asset.id);
      if (idx >= 0) this.removeItem(this.items.indexOf(this.items[idx]));
    }
  }

  getItemForAsset(assetId: number): DraftItem | undefined {
    return this.items.find(i => i.asset_id === assetId);
  }

  private buildFlaggedItems(): DraftItem[] {
    return this.branchAssets
      .filter(a => !this.selectedAssetIds[a.id] && (this.assetObservations[a.id] || '').trim())
      .map(a => ({
        id: this.flaggedItemIds[a.id],
        asset_id: a.id,
        equipment_type: a.type,
        identification_location: a.location || a.name,
        serial: a.serial_number,
        installed: null,
        working: null,
        cleaning_done: null,
        notes: this.assetObservations[a.id].trim(),
        checklist_entries: [],
        _files: [],
        _previews: [],
        _savedPhotos: [],
      }));
  }

  addManualItem(): void {
    this.items.push({
      asset_id: null,
      equipment_type: this.equipmentTypes[0],
      identification_location: '',
      serial: '',
      installed: true,
      working: true,
      cleaning_done: true,
      notes: '',
      checklist_entries: buildChecklistForType(this.equipmentTypes[0]),
      _files: [],
      _previews: [],
      _savedPhotos: [],
    });
  }

  onManualTypeChange(item: DraftItem): void {
    item.checklist_entries = buildChecklistForType(item.equipment_type);
  }

  // groupedBranchAssets crea objetos nuevos en cada ciclo; sin trackBy, Angular
  // recrea las fichas (y sus ngModel) en cada ciclo y entra en un bucle infinito.
  trackByCategory(_: number, group: { category: string }): string {
    return group.category;
  }

  trackByAssetId(_: number, asset: Asset): number {
    return asset.id;
  }

  trackByIndex(index: number): number {
    return index;
  }

  removeItem(index: number): void {
    const item = this.items[index];
    if (item.asset_id) this.selectedAssetIds[item.asset_id] = false;
    item._previews.forEach(url => URL.revokeObjectURL(url));
    this.items.splice(index, 1);
  }

  onPhotosSelected(item: DraftItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    item._files.push(...files);
    files.forEach(f => item._previews.push(URL.createObjectURL(f)));
    input.value = '';
  }

  removePhoto(item: DraftItem, index: number): void {
    URL.revokeObjectURL(item._previews[index]);
    item._files.splice(index, 1);
    item._previews.splice(index, 1);
  }

  private uploadPendingPhotos(savedItems: { id: number }[], sourceItems: DraftItem[], onDone: () => void): void {
    const uploads = savedItems
      .map((savedItem, i) => ({ savedItem, files: sourceItems[i]?._files || [] }))
      .filter(u => u.files.length > 0);

    if (uploads.length === 0) {
      onDone();
      return;
    }

    let remaining = uploads.length;
    uploads.forEach(u => {
      this.visitService.uploadItemPhotos(u.savedItem.id, u.files).subscribe({
        next: () => { remaining--; if (remaining === 0) onDone(); },
        error: (err) => {
          // La visita ya quedó guardada; solo se avisa qué fotos no se pudieron subir
          this.toast.error(`No se pudieron subir las fotos: ${err.error?.detail || 'error al subir'}`);
          remaining--; if (remaining === 0) onDone();
        },
      });
    });
  }

  /** Empareja cada equipo enviado con su id guardado. Los que ya tenian id lo
   * conservan; los nuevos reciben, en orden, los ids que no existian antes (el
   * backend los crea en el orden enviado, asi que sus ids son crecientes). */
  private savedIdsFor(sent: DraftItem[], saved: MaintenanceVisit): { id: number }[] {
    const sentIds = new Set(sent.filter(i => i.id).map(i => i.id));
    const newIds = saved.items.map(i => i.id).filter(i => !sentIds.has(i)).sort((a, b) => a - b);
    return sent.map(i => ({ id: i.id ?? newIds.shift()! }));
  }

  onSignedReportSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.visitId) return;

    this.uploadingReport = true;
    this.reportErrorMessage = '';
    this.visitService.uploadSignedReport(this.visitId, file).subscribe({
      next: (updated) => {
        this.signedReportPath = updated.signed_report_path;
        this.uploadingReport = false;
        input.value = '';
      },
      error: (err) => {
        this.reportErrorMessage = err.error?.detail || 'No se pudo subir la hoja firmada';
        this.uploadingReport = false;
        input.value = '';
      },
    });
  }

  removeSignedReport(): void {
    if (!this.visitId) return;
    this.visitService.deleteSignedReport(this.visitId).subscribe({
      next: (updated) => this.signedReportPath = updated.signed_report_path,
      error: () => this.reportErrorMessage = 'No se pudo eliminar la hoja firmada',
    });
  }

  photoUrl(path: string): string {
    return this.visitService.photoUrl(path);
  }

  submitVisit(status: 'borrador' | 'completado'): void {
    if (!this.header.branch_id || !this.header.technician_id) {
      this.errorMessage = 'Selecciona sucursal y técnico';
      this.toast.error(this.errorMessage);
      return;
    }

    if (status === 'completado' && !this.signedReportPath) {
      this.errorMessage = 'Debes subir la hoja firmada por el encargado antes de finalizar la visita';
      this.toast.error(this.errorMessage);
      return;
    }

    if (status === 'completado' && this.pendingAssets.length > 0) {
      const names = this.pendingAssets.map(a => a.name).join(', ');
      this.errorMessage = `Marca como atendidos o justifica con una observación estos equipos antes de finalizar: ${names}`;
      this.toast.error(`Faltan ${this.pendingAssets.length} equipo(s) por marcar o justificar`);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const navigateAfterSave = (id: number) => {
      const path = status === 'completado'
        ? ['/maintenance-visits', id, 'print']
        : ['/maintenance-visits', id];
      this.router.navigate(path);
    };

    const allItems = [...this.items, ...this.buildFlaggedItems()];

    const reasons = Object.keys(this.selectedReasons).filter(r => this.selectedReasons[r]);
    const checklist_entries: MaintenanceVisitChecklistEntryCreate[] =
      this.checklistGroups.flatMap(g => g.entries);

    const headerPayload = {
      ...this.header,
      entry_time: this.header.entry_time || null,
      exit_time: this.header.exit_time || null,
      camera_review_time: this.header.camera_review_time || null,
      visit_reasons: JSON.stringify(reasons),
      status,
    };

    if (this.isCompleting && this.visitId) {
      const id = this.visitId;
      // Una sola llamada: la cabecera y la lista completa de equipos y checklist.
      // El backend actualiza los que traen id, crea los nuevos y borra los quitados.
      this.visitService.updateVisit(id, {
        ...headerPayload,
        items: allItems.map(({ _files, _previews, _savedPhotos, ...rest }) => rest),
        checklist_entries,
      }).subscribe({
        next: (saved) => {
          this.uploadPendingPhotos(this.savedIdsFor(allItems, saved), allItems, () => {
            this.loading = false;
            navigateAfterSave(id);
          });
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.detail || 'No se pudo actualizar la visita';
        },
      });
      return;
    }

    const payload = {
      ...headerPayload,
      items: allItems.map(({ _files, _previews, _savedPhotos, ...rest }) => rest),
      checklist_entries,
    };

    this.visitService.createVisit(payload).subscribe({
      next: (created) => {
        this.uploadPendingPhotos(created.items, allItems, () => {
          this.loading = false;
          navigateAfterSave(created.id);
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.detail || 'No se pudo guardar la visita';
      },
    });
  }
}
