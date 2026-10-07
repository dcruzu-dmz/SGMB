import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchesService, Branch, BranchCreate, BranchUpdate, BRANCH_CHAINS } from '../../../../core/services/branches.service';
import { AssetsService, Asset } from '../../../../core/services/assets.service';
import { LabelPipe } from '../../../../core/pipes/label.pipe';
import { SearchService } from '../../../../core/services/search.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LabelPipe, PaginationComponent],
  templateUrl: './branches-list.component.html',
  styleUrl: './branches-list.component.css',
})
export class BranchesListComponent implements OnInit{
  private branchesService = inject(BranchesService);
  private assetsService = inject(AssetsService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  branches: Branch[] = [];
  assets: Asset[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  page = 1;
  pageSize = 10;

  isEditing = false;
  selectedBranchId: number | null = null;
  showFormModal = false;

  assetsModalBranch: Branch | null = null;
  chains = BRANCH_CHAINS;

  form = {
    name: '',
    address: '',
    phone: '',
    chain: null as string | null,
    is_active: false,
    maintenance_frequency_days: null as number | null,
  };

ngOnInit(): void {
    this.loadBranches();
    this.assetsService.getAssets().subscribe({ next: res => this.assets = res });
    this.searchService.term.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(term => {
      this.searchTerm = term;
      this.page = 1;
    });
  }

  get visibleBranches(): Branch[] {
    if (!this.searchTerm) return this.branches;
    return this.branches.filter(b =>
      b.name?.toLowerCase().includes(this.searchTerm) ||
      b.address?.toLowerCase().includes(this.searchTerm) ||
      b.phone?.toLowerCase().includes(this.searchTerm)
    );
  }

  get pagedBranches(): Branch[] {
    const start = (this.page - 1) * this.pageSize;
    return this.visibleBranches.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.page = page;
  }

  get assetsForModal(): Asset[] {
    if (!this.assetsModalBranch) return [];
    return this.assets.filter(a => a.branch_id === this.assetsModalBranch!.id);
  }

  showAssets(branch: Branch): void {
    this.assetsModalBranch = branch;
  }

  closeAssetsModal(): void {
    this.assetsModalBranch = null;
  }

  loadBranches(): void {
    this.loading = true;
    this.branchesService.getBranches().subscribe({
      next: (res) => {
        this.branches = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las sucursales';
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.form = {
      name: '',
      address: '',
      phone: '',
      chain: null,
      is_active: true,
      maintenance_frequency_days: null,
    };
    this.isEditing = false;
    this.selectedBranchId = null;
    this.errorMessage = '';
  }

  openCreateModal(): void {
    this.resetForm();
    this.showFormModal = true;
  }

  openEditModal(branch: Branch): void {
    this.editBranch(branch);
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  submitForm(): void {
    if (this.isEditing && this.selectedBranchId !== null) {
      const updatedBranch: BranchUpdate = {
        name: this.form.name,
        address: this.form.address,
        phone: this.form.phone,
        chain: this.form.chain,
        is_active: this.form.is_active,
        maintenance_frequency_days: this.form.maintenance_frequency_days,
      };
      this.branchesService.updateBranch(this.selectedBranchId, updatedBranch).subscribe({
        next: () => {
          this.loadBranches();
          this.closeFormModal();
          this.toast.success('Sucursal actualizada correctamente');
        },
        error: () => {
          this.errorMessage = 'No se pudo actualizar la sucursal';
        }
      });
      return;
  }

  const createData: BranchCreate = {
    name: this.form.name,
    address: this.form.address,
    phone: this.form.phone,
    chain: this.form.chain,
    maintenance_frequency_days: this.form.maintenance_frequency_days,
  };
  this.branchesService.createBranch(createData).subscribe({
    next: () => {
      this.loadBranches();
      this.closeFormModal();
      this.toast.success('Sucursal creada correctamente');
    },
    error: () => {
      this.errorMessage = 'No se pudo crear la sucursal';
    }
  });
}

editBranch(branch: Branch): void {
    this.isEditing = true;
    this.selectedBranchId = branch.id;

    this.form.name = branch.name;
    this.form.address = branch.address;
    this.form.phone = branch.phone;
    this.form.chain = branch.chain;
    this.form.is_active = branch.is_active;
    this.form.maintenance_frequency_days = branch.maintenance_frequency_days;
  }

  async toggleStatus(branch: Branch): Promise<void> {
    const activating = !branch.is_active;

    if (!activating) {
      const confirmed = await this.confirmService.confirm({
        title: 'Desactivar sucursal',
        message: `¿Seguro que deseas desactivar "${branch.name}"? Podrás reactivarla cuando quieras.`,
        confirmText: 'Desactivar',
        danger: true,
      });
      if (!confirmed) return;
    }

    this.branchesService.changeBranchStatus(branch.id, activating).subscribe({
      next: () => {
        this.loadBranches();
        this.toast.success(activating ? 'Sucursal activada' : 'Sucursal desactivada');
      },
      error: () => {
        this.toast.error('No se pudo cambiar el estado de la sucursal');
      }
    });
  }
}
