import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchesService, Branch, BranchCreate, BranchUpdate } from '../../../../core/services/branches.service';
import { AssetsService, Asset } from '../../../../core/services/assets.service';
import { LabelPipe } from '../../../../core/pipes/label.pipe';
import { SearchService } from '../../../../core/services/search.service';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LabelPipe],
  templateUrl: './branches-list.component.html',
  styleUrl: './branches-list.component.css',
})
export class BranchesListComponent implements OnInit{
  private branchesService = inject(BranchesService);
  private assetsService = inject(AssetsService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);

  branches: Branch[] = [];
  assets: Asset[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  isEditing = false;
  selectedBranchId: number | null = null;

  assetsModalBranch: Branch | null = null;

  form = {
    name: '',
    address: '',
    phone: '',
    is_active: false,
    maintenance_frequency_days: null as number | null,
  };

ngOnInit(): void {
    this.loadBranches();
    this.assetsService.getAssets().subscribe({ next: res => this.assets = res });
    this.searchService.term.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(term => this.searchTerm = term);
  }

  get visibleBranches(): Branch[] {
    if (!this.searchTerm) return this.branches;
    return this.branches.filter(b =>
      b.name?.toLowerCase().includes(this.searchTerm) ||
      b.address?.toLowerCase().includes(this.searchTerm) ||
      b.phone?.toLowerCase().includes(this.searchTerm)
    );
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
      is_active: true,
      maintenance_frequency_days: null,
    };
    this.isEditing = false;
    this.selectedBranchId = null;
  }

  submitForm(): void {
    if (this.isEditing && this.selectedBranchId !== null) {
      const updatedBranch: BranchUpdate = {
        name: this.form.name,
        address: this.form.address,
        phone: this.form.phone,
        is_active: this.form.is_active,
        maintenance_frequency_days: this.form.maintenance_frequency_days,
      };
      this.branchesService.updateBranch(this.selectedBranchId, updatedBranch).subscribe({
        next: () => {
          this.loadBranches();
          this.resetForm();
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
    maintenance_frequency_days: this.form.maintenance_frequency_days,
  };
  this.branchesService.createBranch(createData).subscribe({
    next: () => {
      this.loadBranches();
      this.resetForm();
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
    this.form.is_active = branch.is_active;
    this.form.maintenance_frequency_days = branch.maintenance_frequency_days;
  }

  toggleStatus(branch: Branch): void {
    this.branchesService.changeBranchStatus(branch.id, !branch.is_active).subscribe({
      next: () => { this.loadBranches(); },
      error: () => {
        this.errorMessage = 'No se pudo cambiar el estado de la sucursal';
      }
    });
  }
}
