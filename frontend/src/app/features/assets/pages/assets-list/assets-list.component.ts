import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AssetsService, Asset, AssetCreate, AssetUpdate } from '../../../../core/services/assets.service';
import { LabelPipe } from '../../../../core/pipes/label.pipe';
import { SearchService } from '../../../../core/services/search.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { AuthService, CurrentUser } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
import { EquipmentIconComponent } from '../../../../shared/equipment-icon/equipment-icon.component';
import { AssignedTasksService, TASK_TYPE_INVENTORY } from '../../../../core/services/assigned-tasks.service';
import { CorrectiveRequestService, CorrectiveRequest } from '../../../../core/services/corrective-requests.service';
import { UsersService, User } from '../../../../core/services/users.service';
import { isCpuType, isDvrType, isMonitorType, equipmentCategory, groupByEquipmentCategory, EQUIPMENT_CATEGORY_ORDER, EQUIPMENT_DEFAULT_TYPE } from '../../../../core/utils/equipment-category';


@Component({
  selector: 'app-assets-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LabelPipe, RouterLink, PaginationComponent, EquipmentIconComponent],
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
  private assignedTasksService = inject(AssignedTasksService);
  private correctiveRequestService = inject(CorrectiveRequestService);
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);

  assets: Asset[] = [];
  branches: Branch[] = [];
  correctiveRequests: CorrectiveRequest[] = [];
  users: User[] = [];
  viewingAsset: Asset | null = null;
  searchTerm = '';
  filterBranchId: number | null = null;
  activeCategory = 'Todos';
  loading = false;
  errorMessage = '';
  canManage = false;
  currentUser: CurrentUser | null = null;
  authorizedBranchIds = new Set<number>();
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
    channels: null as number | null,
    screen_size: '',
    video_port: '',
    };

  ngOnInit(): void {
    this.loadAssets();
    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
    this.correctiveRequestService.getCorrectiveRequest().subscribe({ next: res => this.correctiveRequests = res });
    this.usersService.getUsers().subscribe({ next: res => this.users = res });
    this.authService.getMe().subscribe({
      next: res => {
        this.currentUser = res;
        this.canManage = res.role === 'admin';
        if (res.role === 'tecnico') {
          this.loadAuthorizedBranches();
        }
      },
    });
    this.searchService.term.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(term => {
      this.searchTerm = term;
      this.page = 1;
    });

    const branchParam = this.route.snapshot.queryParamMap.get('branch');
    if (branchParam) {
      this.filterBranchId = Number(branchParam);
    }
  }

  loadAuthorizedBranches(): void {
    this.assignedTasksService.getTasks().subscribe({
      next: res => {
        this.authorizedBranchIds = new Set(
          res.filter(t => t.status === 'activa' && t.task_type === TASK_TYPE_INVENTORY)
            .map(t => t.branch_id)
        );
      },
    });
  }

  canEditAsset(asset: Asset): boolean {
    if (this.canManage) return true;
    return asset.branch_id !== null && this.authorizedBranchIds.has(asset.branch_id);
  }

  get canCreateAsset(): boolean {
    return this.canManage || this.authorizedBranchIds.size > 0;
  }

  get formBranches(): Branch[] {
    if (this.canManage) return this.branches;
    return this.branches.filter(b => this.authorizedBranchIds.has(b.id));
  }

  getBranchName(id: number | null): string {
    if (!id) return 'Sin asignar';
    return this.branches.find(b => b.id === id)?.name || 'Desconocida';
  }

  getTechnicianName(id: number | null): string {
    if (!id) return 'Sin asignar';
    return this.users.find(u => u.id === id)?.name || 'Desconocido';
  }

  isCpu(type: string | null | undefined): boolean {
    return isCpuType(type);
  }

  get formIsCpu(): boolean {
    return isCpuType(this.form.type);
  }

  get formIsDvr(): boolean {
    return isDvrType(this.form.type);
  }

  isDvr(type: string | null | undefined): boolean {
    return isDvrType(type);
  }

  get formIsMonitor(): boolean {
    return isMonitorType(this.form.type);
  }

  isMonitor(type: string | null | undefined): boolean {
    return isMonitorType(type);
  }

  assetRequests(assetId: number): CorrectiveRequest[] {
    return this.correctiveRequests
      .filter(r => r.asset_id === assetId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  openDetailModal(asset: Asset): void {
    this.viewingAsset = asset;
  }

  closeDetailModal(): void {
    this.viewingAsset = null;
  }

  get branchFilteredAssets(): Asset[] {
    return this.assets.filter(a => {
      const matchesBranch = !this.filterBranchId || a.branch_id === this.filterBranchId;
      const matchesSearch = !this.searchTerm ||
        a.name?.toLowerCase().includes(this.searchTerm) ||
        a.type?.toLowerCase().includes(this.searchTerm) ||
        a.location?.toLowerCase().includes(this.searchTerm);
      return matchesBranch && matchesSearch;
    });
  }

  get categoryTabs(): { category: string; count: number }[] {
    const counts = new Map(
      groupByEquipmentCategory(this.branchFilteredAssets, a => a.type).map(g => [g.category, g.items.length] as const)
    );
    return EQUIPMENT_CATEGORY_ORDER
      .map(category => ({ category, count: counts.get(category) ?? 0 }))
      .filter(tab => tab.count > 0 || tab.category !== 'Otros');
  }

  get visibleAssets(): Asset[] {
    if (this.activeCategory === 'Todos') return this.branchFilteredAssets;
    return this.branchFilteredAssets.filter(a => equipmentCategory(a.type) === this.activeCategory);
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.page = 1;
  }

  onFilterBranchChange(): void {
    this.activeCategory = 'Todos';
    this.page = 1;
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
      channels: null,
      screen_size: '',
      video_port: '',
    };
    this.isEditing = false;
    this.selectedAssetId = null;
    this.errorMessage = '';
  }

  openCreateModal(): void {
    this.resetForm();
    if (this.activeCategory !== 'Todos') {
      this.form.type = EQUIPMENT_DEFAULT_TYPE[this.activeCategory] ?? '';
    }
    if (!this.canManage && this.formBranches.length === 1) {
      this.form.branch_id = this.formBranches[0].id;
    }
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

  submitForm(assetForm: NgForm): void {
    if (assetForm.invalid) {
      assetForm.form.markAllAsTouched();
      return;
    }

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
        channels: this.form.channels,
        screen_size: this.form.screen_size || null,
        video_port: this.form.video_port || null,
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
      channels: this.form.channels,
      screen_size: this.form.screen_size || null,
      video_port: this.form.video_port || null,
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
    this.form.channels = asset.channels ?? null;
    this.form.screen_size = asset.screen_size || '';
    this.form.video_port = asset.video_port || '';
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

    this.changeAssetStatus(asset, nextStatus, reactivating ? 'Equipo reactivado' : 'Equipo dado de baja');
  }

  async requestBaja(asset: Asset): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Solicitar baja de equipo',
      message: `Se notificará al administrador para que revise y confirme la baja de "${asset.name}". El equipo no se dará de baja todavía.`,
      confirmText: 'Solicitar baja',
      danger: true,
    });
    if (!confirmed) return;

    this.changeAssetStatus(asset, 'baja_solicitada', 'Baja solicitada, un administrador debe confirmarla');
  }

  async confirmBaja(asset: Asset): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Confirmar baja de equipo',
      message: `¿Confirmas dar de baja definitivamente "${asset.name}"?`,
      confirmText: 'Confirmar baja',
      danger: true,
    });
    if (!confirmed) return;

    this.changeAssetStatus(asset, 'dado_de_baja', 'Baja confirmada');
  }

  rejectBaja(asset: Asset): void {
    this.changeAssetStatus(asset, 'disponible', 'Solicitud de baja rechazada, equipo disponible de nuevo');
  }

  private changeAssetStatus(asset: Asset, status: string, successMessage: string): void {
    this.assetsService.changeStatus(asset.id, status).subscribe({
      next: () => {
        this.loadAssets();
        this.toast.success(successMessage);
      },
      error: () => {
        this.toast.error('No se pudo cambiar el estado del equipo');
      }
    });
  }
}
