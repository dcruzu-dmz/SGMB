import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AssetsService, AssetCreate } from '../../../../core/services/assets.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';

interface ClientRow {
  number: number;
  hasScanner: boolean;
  hasPrinter: boolean;
}

@Component({
  selector: 'app-bulk-branch-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bulk-branch-assets.component.html',
  styleUrl: './bulk-branch-assets.component.css',
})
export class BulkBranchAssetsComponent implements OnInit {
  private assetsService = inject(AssetsService);
  private branchesService = inject(BranchesService);
  private router = inject(Router);

  branches: Branch[] = [];
  clients: ClientRow[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  form = {
    branch_id: null as number | null,
    includeServer: true,
    serverName: '',
    serverHasKeyboard: true,
    serverHasMouse: true,
    serverHasUps: true,
    serverHasScanner: false,
    includeDvr: true,
    cameraCount: 0,
    clientCount: 0,
    cpuProcessor: '',
    cpuRam: '',
    cpuStorage: '',
    cpuOs: '',
  };

  ngOnInit(): void {
    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
  }

  onClientCountChange(): void {
    const count = Math.max(0, Math.floor(this.form.clientCount || 0));
    if (count > this.clients.length) {
      for (let i = this.clients.length + 1; i <= count; i++) {
        this.clients.push({ number: i, hasScanner: false, hasPrinter: false });
      }
    } else if (count < this.clients.length) {
      this.clients.length = count;
    }
  }

  get totalCount(): number {
    return this.buildPayloads().length;
  }

  private buildAsset(name: string, type: string, location: string, isCpu: boolean): AssetCreate {
    return {
      name,
      type,
      brand: '',
      model: '',
      serial_number: '',
      location,
      status: 'disponible',
      description: '',
      branch_id: this.form.branch_id,
      ram: isCpu ? (this.form.cpuRam || null) : null,
      storage: isCpu ? (this.form.cpuStorage || null) : null,
      processor: isCpu ? (this.form.cpuProcessor || null) : null,
      operating_system: isCpu ? (this.form.cpuOs || null) : null,
    };
  }

  private buildPayloads(): AssetCreate[] {
    if (!this.form.branch_id) return [];
    const payloads: AssetCreate[] = [];

    if (this.form.includeServer) {
      const serverName = this.form.serverName.trim() || 'Servidor';
      payloads.push(this.buildAsset(serverName, 'CPU Servidor', 'Servidor', true));
      if (this.form.serverHasKeyboard) {
        payloads.push(this.buildAsset('Teclado - Servidor', 'Teclado', 'Servidor', false));
      }
      if (this.form.serverHasMouse) {
        payloads.push(this.buildAsset('Mouse - Servidor', 'Mouse', 'Servidor', false));
      }
      if (this.form.serverHasUps) {
        payloads.push(this.buildAsset('UPS - Servidor', 'UPS', 'Servidor', false));
      }
      if (this.form.serverHasScanner) {
        payloads.push(this.buildAsset('Escáner - Servidor', 'Escáner de código de barra', 'Servidor', false));
      }
    }
    if (this.form.includeDvr) {
      payloads.push(this.buildAsset('DVR', 'DVR', 'General', false));
    }
    const cameraCount = Math.max(0, Math.floor(this.form.cameraCount || 0));
    for (let i = 1; i <= cameraCount; i++) {
      payloads.push(this.buildAsset(`Cámara ${i}`, 'Cámaras', 'General', false));
    }

    for (const client of this.clients) {
      const label = `Cliente ${client.number}`;
      payloads.push(this.buildAsset(`CPU - ${label}`, 'CPU Cliente', label, true));
      payloads.push(this.buildAsset(`Teclado - ${label}`, 'Teclado', label, false));
      payloads.push(this.buildAsset(`Mouse - ${label}`, 'Mouse', label, false));
      payloads.push(this.buildAsset(`Monitor - ${label}`, 'Monitor', label, false));
      payloads.push(this.buildAsset(`UPS - ${label}`, 'UPS', label, false));
      if (client.hasScanner) {
        payloads.push(this.buildAsset(`Escáner - ${label}`, 'Escáner de código de barra', label, false));
      }
      if (client.hasPrinter) {
        payloads.push(this.buildAsset(`Impresora - ${label}`, 'Impresora de Facturación', label, false));
      }
    }

    return payloads;
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.branch_id) {
      this.errorMessage = 'Selecciona una sucursal';
      return;
    }

    const payloads = this.buildPayloads();
    if (payloads.length === 0) {
      this.errorMessage = 'No hay equipos para generar. Activa el servidor/DVR/cámaras o agrega al menos un cliente.';
      return;
    }

    this.loading = true;
    const requests = payloads.map(p => this.assetsService.createAsset(p));
    forkJoin(requests).subscribe({
      next: (created) => {
        this.loading = false;
        this.successMessage = `Se registraron ${created.length} equipos correctamente.`;
        this.form.clientCount = 0;
        this.form.cameraCount = 0;
        this.clients = [];
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Ocurrió un error al crear los equipos. Revisa el listado de Equipos por si algunos ya se crearon.';
      }
    });
  }
}
