import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { UsersService, User } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AssetsService, Asset } from '../../../../core/services/assets.service';
import {
  MaintenanceVisitService,
  MaintenanceVisitItemCreate,
  MaintenanceVisitChecklistEntryCreate,
} from '../../../../core/services/maintenance-visit.service';

interface DraftItem extends MaintenanceVisitItemCreate {
  _files: File[];
  _previews: string[];
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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './visit-form.component.html',
  styleUrl: './visit-form.component.css',
})
export class VisitFormComponent implements OnInit {
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private assetsService = inject(AssetsService);
  private visitService = inject(MaintenanceVisitService);
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
  items: DraftItem[] = [];
  checklistGroups: ChecklistGroup[] = CHECKLIST_TEMPLATE.map(g => ({
    ...g,
    entries: g.entries.map(e => ({ ...e })),
  }));

  get branchAssets(): Asset[] {
    if (!this.header.branch_id) return [];
    return this.allAssets.filter(a => a.branch_id === this.header.branch_id);
  }

  get manualItems(): DraftItem[] {
    return this.items.filter(i => !i.asset_id);
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.visitId = idParam ? Number(idParam) : null;
    this.isCompleting = !!this.visitId;

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
    });
  }

  onManualTypeChange(item: DraftItem): void {
    item.checklist_entries = buildChecklistForType(item.equipment_type);
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
        error: () => { remaining--; if (remaining === 0) onDone(); },
      });
    });
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
      error: () => {
        this.reportErrorMessage = 'No se pudo subir la hoja firmada';
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
      return;
    }

    if (status === 'completado' && !this.signedReportPath) {
      this.errorMessage = 'Debes subir la hoja firmada por el encargado antes de finalizar la visita';
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
      this.visitService.updateVisit(id, headerPayload).subscribe({
        next: () => {
          let itemsSaved = 0;
          const savedItems: { id: number }[] = [];
          const totalItems = allItems.length;

          const afterAllSaved = () => {
            this.visitService.getVisit(id).subscribe({
              next: (full) => {
                this.uploadPendingPhotos(full.items, allItems, () => {
                  this.loading = false;
                  navigateAfterSave(id);
                });
              },
              error: () => {
                this.loading = false;
                navigateAfterSave(id);
              },
            });
          };

          if (totalItems === 0) {
            afterAllSaved();
            return;
          }

          allItems.forEach(({ _files, _previews, ...rest }) => {
            this.visitService.addVisitItem(id, rest).subscribe({
              next: (saved) => {
                savedItems.push(saved);
                itemsSaved++;
                if (itemsSaved === totalItems) afterAllSaved();
              },
              error: () => {
                itemsSaved++;
                if (itemsSaved === totalItems) afterAllSaved();
              },
            });
          });

          this.visitService.addChecklistEntries(id, checklist_entries).subscribe();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'No se pudo actualizar la visita';
        },
      });
      return;
    }

    const payload = {
      ...headerPayload,
      items: allItems.map(({ _files, _previews, ...rest }) => rest),
      checklist_entries,
    };

    this.visitService.createVisit(payload).subscribe({
      next: (created) => {
        this.uploadPendingPhotos(created.items, allItems, () => {
          this.loading = false;
          navigateAfterSave(created.id);
        });
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo guardar la visita';
      },
    });
  }
}
