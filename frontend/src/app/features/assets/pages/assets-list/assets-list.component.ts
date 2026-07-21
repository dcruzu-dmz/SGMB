import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetsService, Asset, AssetCreate, AssetUpdate } from '../../../../core/services/assets.service';


@Component({
  selector: 'app-assets-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  templateUrl: './assets-list.component.html',
  styleUrl: './assets-list.component.css',
})
export class AssetsListComponent implements OnInit {
  private assetsService = inject(AssetsService);

  assets: Asset[] = [];
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
    };

  ngOnInit(): void {
    this.loadAssets();
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
  }

  toggleStatus(asset: Asset): void {
    this.assetsService.changeStatus(asset.id, asset.status === 'activo' ? 'dado de baja' : 'activo').subscribe({
      next: () => {this.loadAssets()
        ;},
      error: () => {
        this.errorMessage = 'No se pudo cambiar el estado del equipo';
      }
    });
  }
}
