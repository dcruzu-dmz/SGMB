import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetsService, Asset, AssetCreate, AssetUpdate } from '../../../../core/services/assets.service';
import { LabelPipe } from '../../../../core/pipes/label.pipe';
import { SearchService } from '../../../../core/services/search.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';


@Component({
  selector: 'app-assets-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LabelPipe],
  templateUrl: './assets-list.component.html',
  styleUrl: './assets-list.component.css',
})
export class AssetsListComponent implements OnInit {
  private assetsService = inject(AssetsService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);
  private branchesService = inject(BranchesService);

  assets: Asset[] = [];
  branches: Branch[] = [];
  searchTerm = '';
  loading = false;
  errorMessage = '';

  isEditing = false;
  selectedAssetId: number | null = null;

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
    };

  ngOnInit(): void {
    this.loadAssets();
    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
    this.searchService.term.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(term => this.searchTerm = term);
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
    };
    this.isEditing = false;
    this.selectedAssetId = null;
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
      };
      this.assetsService.updateAsset(this.selectedAssetId, updateData).subscribe({
        next: () => {
          this.loadAssets();
          this.resetForm();
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
    };

    this.assetsService.createAsset(createData).subscribe({
      next: () => {
        this.loadAssets();
        this.resetForm();
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
  }

  toggleStatus(asset: Asset): void {
    const nextStatus = asset.status === 'dado_de_baja' ? 'disponible' : 'dado_de_baja';
    this.assetsService.changeStatus(asset.id, nextStatus).subscribe({
      next: () => this.loadAssets(),
      error: () => {
        this.errorMessage = 'No se pudo cambiar el estado del equipo';
      }
    });
  }
}
