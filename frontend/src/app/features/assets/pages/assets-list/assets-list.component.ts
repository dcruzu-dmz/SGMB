import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AssetsService, Asset, AssetCreate, AssetUpdate } from '../../../../core/services/assets.service';
import { LabelPipe } from '../../../../core/pipes/label.pipe';
import { SearchService } from '../../../../core/services/search.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';


@Component({
  selector: 'app-assets-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LabelPipe, RouterLink, PaginationComponent],
  templateUrl: './assets-list.component.html',
  styleUrl: './assets-list.component.css',
})
export class AssetsListComponent implements OnInit {
  private assetsService = inject(AssetsService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);
  private branchesService = inject(BranchesService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  assets: Asset[] = [];
  branches: Branch[] = [];
  searchTerm = '';
  loading = false;
  errorMessage = '';
  canManage = false;
  page = 1;
  pageSize = 10;

  isEditing = false;
  selectedAssetId: number | null = null;
  showFormModal = false;

  form = {
    name: '',
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    location: '',
    status: 'disponible',
    description: '',
    branch_id: null as number | null,
    ram: '',
    storage: '',
    processor: '',
    operating_system: '',
    };

  ngOnInit(): void {
    this.loadAssets();
    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
    this.authService.getMe().subscribe({ next: res => this.canManage = res.role === 'admin' });
    this.searchService.term.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(term => {
      this.searchTerm = term;
      this.page = 1;
    });
  }

  getBranchName(id: number | null): string {
    if (!id) return 'Sin asignar';
    return this.branches.find(b => b.id === id)?.name || 'Desconocida';
  }

  get visibleAssets(): Asset[] {
    if (!this.searchTerm) return this.assets;
    return this.assets.filter(a =>
      a.name?.toLowerCase().includes(this.searchTerm) ||
      a.type?.toLowerCase().includes(this.searchTerm) ||
      a.location?.toLowerCase().includes(this.searchTerm)
    );
  }

  get pagedAssets(): Asset[] {
    const start = (this.page - 1) * this.pageSize;
    return this.visibleAssets.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.page = page;
  }

  loadAssets(): void {
    this.loading = true;
    this.assetsService.getAssets().subscribe({
      next: (res) => {
        this.assets = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los equipos';
        this.loading = false;
      }
    });
  }
   resetForm(): void {
    this.form = {
      name: '',
      type: '',
      brand: '',
      model: '',
      serial_number: '',
      location: '',
      status: 'disponible',
      description: '',
      branch_id: null,
      ram: '',
      storage: '',
      processor: '',
      operating_system: '',
    };
    this.isEditing = false;
    this.selectedAssetId = null;
    this.errorMessage = '';
  }

  openCreateModal(): void {
    this.resetForm();
    this.showFormModal = true;
  }

  openEditModal(asset: Asset): void {
    this.editAsset(asset);
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  submitForm(): void {
    if (this.isEditing && this.selectedAssetId !== null) {
      const updateData: AssetUpdate = {
        name: this.form.name,
        type: this.form.type,
        brand: this.form.brand,
        model: this.form.model,
        serial_number: this.form.serial_number,
        location: this.form.location,
        status: this.form.status,
        description: this.form.description,
        branch_id: this.form.branch_id,
        ram: this.form.ram || null,
        storage: this.form.storage || null,
        processor: this.form.processor || null,
        operating_system: this.form.operating_system || null,
      };
      this.assetsService.updateAsset(this.selectedAssetId, updateData).subscribe({
        next: () => {
          this.loadAssets();
          this.closeFormModal();
          this.toast.success('Equipo actualizado correctamente');
        },
        error: () => {
          this.errorMessage = 'No se pudo actualizar el equipo';
        }
      });

      return;
    }

    const createData: AssetCreate = {
      name: this.form.name,
      type: this.form.type,
      brand: this.form.brand,
      model: this.form.model,
      serial_number: this.form.serial_number,
      location: this.form.location,
      status: this.form.status,
      description: this.form.description,
      branch_id: this.form.branch_id,
      ram: this.form.ram || null,
      storage: this.form.storage || null,
      processor: this.form.processor || null,
      operating_system: this.form.operating_system || null,
    };

    this.assetsService.createAsset(createData).subscribe({
      next: () => {
        this.loadAssets();
        this.closeFormModal();
        this.toast.success('Equipo creado correctamente');
      },
      error: () => {
        this.errorMessage = 'No se pudo crear el equipo';
      }
    });
  }

  editAsset(asset: Asset): void {
    this.isEditing = true;
    this.selectedAssetId = asset.id;

    this.form.name = asset.name;
    this.form.type = asset.type;
    this.form.brand = asset.brand;
    this.form.model = asset.model;
    this.form.serial_number = asset.serial_number;
    this.form.location = asset.location;
    this.form.status = asset.status;
    this.form.description = asset.description;
    this.form.branch_id = asset.branch_id;
    this.form.ram = asset.ram || '';
    this.form.storage = asset.storage || '';
    this.form.processor = asset.processor || '';
    this.form.operating_system = asset.operating_system || '';
  }

  async toggleStatus(asset: Asset): Promise<void> {
    const reactivating = asset.status === 'dado_de_baja';
    const nextStatus = reactivating ? 'disponible' : 'dado_de_baja';

    if (!reactivating) {
      const confirmed = await this.confirmService.confirm({
        title: 'Dar de baja equipo',
        message: `¿Seguro que deseas dar de baja "${asset.name}"? Podrás reactivarlo cuando quieras.`,
        confirmText: 'Dar de baja',
        danger: true,
      });
      if (!confirmed) return;
    }

    this.assetsService.changeStatus(asset.id, nextStatus).subscribe({
      next: () => {
        this.loadAssets();
        this.toast.success(reactivating ? 'Equipo reactivado' : 'Equipo dado de baja');
      },
      error: () => {
        this.toast.error('No se pudo cambiar el estado del equipo');
      }
    });
  }
}
