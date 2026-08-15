import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PreventiveMaintenanceService, PreventiveMaintenance, PreventiveMaintenanceCreate, PreventiveMaintenanceUpdate } from "../../../../core/services/preventive-maintenance.service";
import { AssetsService, Asset } from "../../../../core/services/assets.service";
import { UsersService, User } from "../../../../core/services/users.service";
import { LabelPipe } from "../../../../core/pipes/label.pipe";

@Component({
  selector: 'app-preventive-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LabelPipe],
  templateUrl: './preventive-list.component.html',
  styleUrl: './preventive-list.component.css',
})
export class PreventiveListComponent implements OnInit {
  private preventiveService = inject(PreventiveMaintenanceService);
  private assetsService = inject(AssetsService);
  private usersService = inject(UsersService);

  preventives: PreventiveMaintenance[] = [];
  assets: Asset[] = [];
  technicians: User[] = [];
  loading = false;
  errorMessage = '';

  isEditing = false;
  selectedPreventiveId: number | null = null;

  form = {
    asset_id: 0,
    responsible_id: 0,
    maintenance_type: '',
    frequency: 'mensual',
    scheduled_date: '',
    status: 'pendiente',
    observations: '',
  };

  ngOnInit(): void {
    this.loadPreventives();
    this.loadAssets();
    this.loadTechnicians();
  }

  loadPreventives(): void {
    this.loading = true;
    this.preventiveService.getPreventiveMaintenances().subscribe({
      next: (res) => {
        this.preventives = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los mantenimientos preventivos';
        this.loading = false;
      }
    });
  }

  loadAssets(): void {
    this.assetsService.getAssets().subscribe({
      next: (res) => this.assets = res,
      error: () => this.errorMessage = 'No se pudieron cargar los equipos'
    });
  }

  loadTechnicians(): void {
    this.usersService.getUsers().subscribe({
      next: (res) => this.technicians = res.filter(u => u.role === 'tecnico'),
      error: () => this.errorMessage = 'No se pudieron cargar los técnicos'
    });
  }

  resetForm(): void {
    this.form = {
      asset_id: 0,
      responsible_id: 0,
      maintenance_type: '',
      frequency: 'mensual',
      scheduled_date: '',
      status: 'pendiente',
      observations: '',
    };
    this.isEditing = false;
    this.selectedPreventiveId = null;
    this.errorMessage = '';
  }

  submitForm(): void {
    if (this.isEditing && this.selectedPreventiveId !== null) {
      const updateData: PreventiveMaintenanceUpdate = {
        asset_id: this.form.asset_id,
        responsible_id: this.form.responsible_id,
        maintenance_type: this.form.maintenance_type,
        frequency: this.form.frequency,
        scheduled_date: this.form.scheduled_date,
        status: this.form.status,
        observations: this.form.observations,
      };
      this.preventiveService.updatePreventiveMaintenance(this.selectedPreventiveId, updateData).subscribe({
        next: () => {
          this.loadPreventives();
          this.resetForm();
        },
        error: () => this.errorMessage = 'No se pudo actualizar el mantenimiento'
      });
      return;
    }

    const createData: PreventiveMaintenanceCreate = {
      asset_id: this.form.asset_id,
      responsible_id: this.form.responsible_id,
      maintenance_type: this.form.maintenance_type,
      frequency: this.form.frequency,
      scheduled_date: this.form.scheduled_date,
      status: this.form.status,
      observations: this.form.observations,
    };

    this.preventiveService.createPreventiveMaintenance(createData).subscribe({
      next: () => {
        this.loadPreventives();
        this.resetForm();
      },
      error: () => this.errorMessage = 'No se pudo crear el mantenimiento'
    });
  }

  editPreventive(preventive: PreventiveMaintenance): void {
    this.isEditing = true;
    this.selectedPreventiveId = preventive.id;
    this.form.asset_id = preventive.asset_id;
    this.form.responsible_id = preventive.responsible_id;
    this.form.maintenance_type = preventive.maintenance_type;
    this.form.frequency = preventive.frequency;
    this.form.scheduled_date = preventive.scheduled_date;
    this.form.status = preventive.status;
    this.form.observations = preventive.observations || '';
  }

  changeStatus(preventive: PreventiveMaintenance, status: string): void {
    this.preventiveService.changeStatus(preventive.id, status).subscribe({
      next: () => this.loadPreventives(),
      error: () => this.errorMessage = 'No se pudo cambiar el estado'
    });
  }

  getAssetName(id: number): string {
    return this.assets.find(a => a.id === id)?.name || 'Desconocido';
  }

  getTechnicianName(id: number): string {
    return this.technicians.find(t => t.id === id)?.name || 'Desconocido';
  }
}
