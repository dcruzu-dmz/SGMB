import { Component, OnInit, inject, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CorrectiveRequestService, CorrectiveRequest, CorrectiveRequestCreate, CorrectiveRequestUpdate } from "../../../../core/services/corrective-requests.service";
import { AssetsService, Asset } from "../../../../core/services/assets.service";
import { UsersService, User } from "../../../../core/services/users.service";
import { AuthService } from "../../../../core/services/auth.service";
import { LabelPipe } from "../../../../core/pipes/label.pipe";
import { SearchService } from "../../../../core/services/search.service";

@Component({
  selector: 'app-corrective-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LabelPipe],
  templateUrl: './corrective-requests-list.component.html',
  styleUrl: './corrective-requests-list.component.css',
})
export class CorrectiveRequestListComponent implements OnInit {
  private correctiveRequestsService = inject(CorrectiveRequestService);
  private assetsService = inject(AssetsService);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);

  correctiveRequests: CorrectiveRequest[] = [];
  assets: Asset[] = [];
  technicians: User[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  isEditing = false;
  selectedRequestId: number | null = null;

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
    this.loadCurrentUser();
    this.searchService.term.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(term => this.searchTerm = term);
  }

  get visibleRequests(): CorrectiveRequest[] {
    if (!this.searchTerm) return this.correctiveRequests;
    return this.correctiveRequests.filter(r =>
      r.description?.toLowerCase().includes(this.searchTerm) ||
      this.getAssetName(r.asset_id).toLowerCase().includes(this.searchTerm)
    );
  }

  loadCurrentUser(): void {
    this.authService.getMe().subscribe({
      next: (user) => this.form.requester_id = user.id,
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
    this.errorMessage = '';
  }

  submitForm(): void {
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
          this.resetForm();
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
        this.resetForm();
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
  }

  changeStatus(request: CorrectiveRequest, status: string): void {
    this.correctiveRequestsService.changeStatus(request.id, status).subscribe({
      next: () => this.loadCorrectiveRequests(),
      error: () => this.errorMessage = 'No se pudo cambiar el estado'
    });
  }

  getAssetName(id: number): string {
    return this.assets.find(a => a.id === id)?.name || 'Desconocido';
  }

  getTechnicianName(id: number | null): string {
    if (!id) return 'Sin asignar';
    return this.technicians.find(t => t.id === id)?.name || 'Desconocido';
  }
}