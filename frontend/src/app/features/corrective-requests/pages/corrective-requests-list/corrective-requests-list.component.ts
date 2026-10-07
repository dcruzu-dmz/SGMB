import { Component, OnInit, inject, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CorrectiveRequestService, CorrectiveRequest, CorrectiveRequestCreate, CorrectiveRequestUpdate } from "../../../../core/services/corrective-requests.service";
import { AssetsService, Asset } from "../../../../core/services/assets.service";
import { UsersService, User } from "../../../../core/services/users.service";
import { BranchesService, Branch } from "../../../../core/services/branches.service";
import { AuthService } from "../../../../core/services/auth.service";
import { LabelPipe } from "../../../../core/pipes/label.pipe";
import { SearchService } from "../../../../core/services/search.service";
import { API_BASE_URL } from "../../../../core/config/api-config";
import { ToastService } from "../../../../core/services/toast.service";
import { PaginationComponent } from "../../../../shared/pagination/pagination.component";

@Component({
  selector: 'app-corrective-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LabelPipe, PaginationComponent],
  templateUrl: './corrective-requests-list.component.html',
  styleUrl: './corrective-requests-list.component.css',
})
export class CorrectiveRequestListComponent implements OnInit {
  private correctiveRequestsService = inject(CorrectiveRequestService);
  private assetsService = inject(AssetsService);
  private usersService = inject(UsersService);
  private branchesService = inject(BranchesService);
  private authService = inject(AuthService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);

  correctiveRequests: CorrectiveRequest[] = [];
  assets: Asset[] = [];
  technicians: User[] = [];
  branches: Branch[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  isEditing = false;
  selectedRequestId: number | null = null;
  canCreate = false;
  isTecnico = false;
  filterBranchId: number | null = null;
  uploadingReport = false;
  reportErrorMessage = '';
  showFormModal = false;
  page = 1;
  pageSize = 10;

  form = {
    asset_id: 0,
    requester_id: 0,
    assigned_id: null as number | null,
    description: '',
    priority: 'media',
    status: 'abierta',
    solution: '',
  };

  ngOnInit(): void {
    this.loadCorrectiveRequests();
    this.loadAssets();
    this.loadTechnicians();
    this.loadBranches();
    this.loadCurrentUser();
    this.searchService.term.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(term => {
      this.searchTerm = term;
      this.page = 1;
    });
  }

  get assetsForForm(): Asset[] {
    if (!this.filterBranchId) return this.assets;
    return this.assets.filter(a => a.branch_id === this.filterBranchId);
  }

  get selectedRequest(): CorrectiveRequest | undefined {
    return this.correctiveRequests.find(r => r.id === this.selectedRequestId);
  }

  get hasSignedReport(): boolean {
    return !!this.selectedRequest?.signed_report_path;
  }

  get visibleRequests(): CorrectiveRequest[] {
    if (!this.searchTerm) return this.correctiveRequests;
    return this.correctiveRequests.filter(r =>
      r.description?.toLowerCase().includes(this.searchTerm) ||
      this.getAssetName(r.asset_id).toLowerCase().includes(this.searchTerm)
    );
  }

  get pagedRequests(): CorrectiveRequest[] {
    const start = (this.page - 1) * this.pageSize;
    return this.visibleRequests.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.page = page;
  }

  loadCurrentUser(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.form.requester_id = user.id;
        this.canCreate = user.role === 'admin' || user.role === 'solicitante';
        this.isTecnico = user.role === 'tecnico';
      },
      error: () => this.errorMessage = 'No se pudo identificar al usuario actual'
    });
  }

  loadCorrectiveRequests(): void {
    this.loading = true;
    this.correctiveRequestsService.getCorrectiveRequest().subscribe({
      next: (res) => {
        this.correctiveRequests = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las solicitudes';
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

  loadBranches(): void {
    this.branchesService.getBranches().subscribe({
      next: (res) => this.branches = res,
      error: () => this.errorMessage = 'No se pudieron cargar las sucursales'
    });
  }

  onFilterBranchChange(): void {
    if (this.filterBranchId && this.form.asset_id) {
      const asset = this.assets.find(a => a.id === this.form.asset_id);
      if (!asset || asset.branch_id !== this.filterBranchId) {
        this.form.asset_id = 0;
      }
    }
  }

  resetForm(): void {
    this.form = {
      asset_id: 0,
      requester_id: this.form.requester_id,
      assigned_id: null,
      description: '',
      priority: 'media',
      status: 'abierta',
      solution: '',
    };
    this.isEditing = false;
    this.selectedRequestId = null;
    this.filterBranchId = null;
    this.errorMessage = '';
    this.reportErrorMessage = '';
  }

  openCreateModal(): void {
    this.resetForm();
    this.showFormModal = true;
  }

  openEditModal(request: CorrectiveRequest): void {
    this.editRequest(request);
    this.showFormModal = true;
  }

  openCloseModal(request: CorrectiveRequest): void {
    this.startClosing(request);
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  submitForm(): void {
    if (this.form.status === 'cerrada' && !this.form.solution.trim()) {
      this.errorMessage = 'Debes especificar qué se hizo antes de cerrar la solicitud';
      return;
    }

    if (this.form.status === 'cerrada' && !this.hasSignedReport) {
      this.errorMessage = 'Debes subir la hoja firmada por el encargado antes de cerrar la solicitud';
      return;
    }

    if (this.isEditing && this.selectedRequestId !== null) {
      const updateData: CorrectiveRequestUpdate = {
        asset_id: this.form.asset_id,
        requester_id: this.form.requester_id,
        assigned_id: this.form.assigned_id,
        description: this.form.description,
        priority: this.form.priority,
        status: this.form.status,
        solution: this.form.solution || null,
      };
      this.correctiveRequestsService.updateCorrectiveRequest(this.selectedRequestId, updateData).subscribe({
        next: () => {
          this.loadCorrectiveRequests();
          this.closeFormModal();
          this.toast.success(this.form.status === 'cerrada' ? 'Solicitud cerrada correctamente' : 'Solicitud actualizada correctamente');
        },
        error: () => this.errorMessage = 'No se pudo actualizar la solicitud'
      });
      return;
    }

    const createData: CorrectiveRequestCreate = {
      asset_id: this.form.asset_id,
      requester_id: this.form.requester_id,
      assigned_id: this.form.assigned_id,
      description: this.form.description,
      priority: this.form.priority,
      status: this.form.status,
    };

    this.correctiveRequestsService.createCorrectiveRequest(createData).subscribe({
      next: () => {
        this.loadCorrectiveRequests();
        this.closeFormModal();
        this.toast.success('Solicitud creada correctamente');
      },
      error: () => this.errorMessage = 'No se pudo crear la solicitud'
    });
  }

  editRequest(request: CorrectiveRequest): void {
    this.isEditing = true;
    this.selectedRequestId = request.id;
    this.form.asset_id = request.asset_id;
    this.form.requester_id = request.requester_id;
    this.form.assigned_id = request.assigned_id;
    this.form.description = request.description;
    this.form.priority = request.priority;
    this.form.status = request.status;
    this.form.solution = request.solution || '';
    this.filterBranchId = this.assets.find(a => a.id === request.asset_id)?.branch_id ?? null;
    this.reportErrorMessage = '';
  }

  startClosing(request: CorrectiveRequest): void {
    this.editRequest(request);
    this.form.status = 'cerrada';
  }

  startReview(request: CorrectiveRequest): void {
    this.correctiveRequestsService.changeStatus(request.id, 'en_proceso').subscribe({
      next: () => {
        this.loadCorrectiveRequests();
        this.toast.success('Solicitud puesta en revisión');
      },
      error: () => this.toast.error('No se pudo poner en revisión la solicitud')
    });
  }

  getAssetName(id: number): string {
    return this.assets.find(a => a.id === id)?.name || 'Desconocido';
  }

  getTechnicianName(id: number | null): string {
    if (!id) return 'Sin asignar';
    return this.technicians.find(t => t.id === id)?.name || 'Desconocido';
  }

  reportUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
  }

  onSignedReportSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.selectedRequestId === null) return;

    this.uploadingReport = true;
    this.reportErrorMessage = '';
    this.correctiveRequestsService.uploadSignedReport(this.selectedRequestId, file).subscribe({
      next: (updated) => {
        this.correctiveRequests = this.correctiveRequests.map(r => r.id === updated.id ? updated : r);
        this.uploadingReport = false;
        input.value = '';
        this.toast.success('Hoja firmada subida correctamente');
      },
      error: () => {
        this.reportErrorMessage = 'No se pudo subir la hoja firmada';
        this.uploadingReport = false;
        input.value = '';
      },
    });
  }

  removeSignedReport(): void {
    if (this.selectedRequestId === null) return;
    this.correctiveRequestsService.deleteSignedReport(this.selectedRequestId).subscribe({
      next: (updated) => {
        this.correctiveRequests = this.correctiveRequests.map(r => r.id === updated.id ? updated : r);
        this.toast.success('Hoja firmada eliminada');
      },
      error: () => this.reportErrorMessage = 'No se pudo eliminar la hoja firmada',
    });
  }
}