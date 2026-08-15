import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { UsersService, User } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
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
    category: 'limpieza', title: 'Limpieza', entries: [
      'Case', 'Monitor', 'Mouse', 'Teclado', 'DVR',
      'Uso de sopladora', 'Limpieza de motherboard', 'Lubricación de partes móviles',
      'Encender el equipo y verificar que inicie correctamente el sistema operativo',
    ].map(label => ({ category: 'limpieza', label, checked: false })),
  },
  {
    category: 'software', title: 'Software / Aplicaciones instaladas', entries: [
      'Sistema de punto de venta', 'Servicio de impresión', '7-Zip',
      'ESET Antivirus (actualizado)', 'Mozilla Firefox', 'Google Chrome',
      'TightVNC / VNC', 'OpenOffice', 'Owncloud', 'Spark Chat',
      'Zimbra Desktop (revisar cuota de correo)', 'Zoiper',
      'Movimientos de inventario (acceso directo)', 'Pedidos emergentes',
      'Artículos (acceso directo)', 'Actualiza maestros (acceso directo)',
    ].map(label => ({ category: 'software', label, checked: false })),
  },
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

@Component({
  selector: 'app-visit-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visit-form.component.html',
  styleUrl: './visit-form.component.css',
})
export class VisitFormComponent implements OnInit {
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private visitService = inject(MaintenanceVisitService);
  private router = inject(Router);

  branches: Branch[] = [];
  technicians: User[] = [];
  equipmentTypes = EQUIPMENT_TYPES;
  visitReasons = VISIT_REASONS;

  loading = false;
  errorMessage = '';

  header = {
    branch_id: 0,
    technician_id: 0,
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
  items: DraftItem[] = [];
  checklistGroups: ChecklistGroup[] = CHECKLIST_TEMPLATE.map(g => ({
    ...g,
    entries: g.entries.map(e => ({ ...e })),
  }));

  ngOnInit(): void {
    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
    this.usersService.getUsers().subscribe({
      next: res => this.technicians = res.filter(u => u.role === 'tecnico' || u.role === 'admin'),
    });
    this.authService.getMe().subscribe({
      next: user => this.header.technician_id = user.id,
    });
    this.addItem();
  }

  addItem(): void {
    this.items.push({
      equipment_type: this.equipmentTypes[0],
      identification_location: '',
      serial: '',
      installed: true,
      working: true,
      cleaning_done: true,
      notes: '',
      _files: [],
      _previews: [],
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  removeItem(index: number): void {
    this.items[index]._previews.forEach(url => URL.revokeObjectURL(url));
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

  submitVisit(status: 'borrador' | 'completado'): void {
    if (!this.header.branch_id || !this.header.technician_id) {
      this.errorMessage = 'Selecciona sucursal y técnico';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const reasons = Object.keys(this.selectedReasons).filter(r => this.selectedReasons[r]);
    const checklist_entries: MaintenanceVisitChecklistEntryCreate[] =
      this.checklistGroups.flatMap(g => g.entries);

    const payload = {
      ...this.header,
      entry_time: this.header.entry_time || null,
      exit_time: this.header.exit_time || null,
      camera_review_time: this.header.camera_review_time || null,
      visit_reasons: JSON.stringify(reasons),
      status,
      items: this.items.map(({ _files, _previews, ...rest }) => rest),
      checklist_entries,
    };

    this.visitService.createVisit(payload).subscribe({
      next: (created) => {
        const uploads = created.items
          .map((savedItem, i) => ({ savedItem, files: this.items[i]?._files || [] }))
          .filter(u => u.files.length > 0);

        if (uploads.length === 0) {
          this.loading = false;
          this.router.navigate(['/maintenance-visits', created.id]);
          return;
        }

        let remaining = uploads.length;
        uploads.forEach(u => {
          this.visitService.uploadItemPhotos(u.savedItem.id, u.files).subscribe({
            next: () => {
              remaining--;
              if (remaining === 0) {
                this.loading = false;
                this.router.navigate(['/maintenance-visits', created.id]);
              }
            },
            error: () => {
              remaining--;
              if (remaining === 0) {
                this.loading = false;
                this.router.navigate(['/maintenance-visits', created.id]);
              }
            },
          });
        });
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo guardar la visita';
      },
    });
  }
}
