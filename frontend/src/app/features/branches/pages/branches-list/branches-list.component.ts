import { Component, OnInit, inject  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchesService, Branch, BranchCreate, BranchUpdate } from '../../../../core/services/branches.service';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branches-list.component.html',
  styleUrl: './branches-list.component.css',
})
export class BranchesListComponent implements OnInit{
  private branchesService = inject(BranchesService);

  branches: Branch[] = [];
  loading = false;
  errorMessage = '';

  isEditing = false;
  selectedBranchId: number | null = null;

  form = {
    name: '',
    address: '',
    phone: '',
    is_active: false,
  };

ngOnInit(): void {
    this.loadBranches();
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
