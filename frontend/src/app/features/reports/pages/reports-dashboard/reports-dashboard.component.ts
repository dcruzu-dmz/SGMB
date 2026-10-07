import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { forkJoin } from "rxjs";
import { AssetsService, Asset } from "../../../../core/services/assets.service";
import { BranchesService, Branch } from "../../../../core/services/branches.service";
import { UsersService, User } from "../../../../core/services/users.service";
import { CorrectiveRequestService, CorrectiveRequest } from "../../../../core/services/corrective-requests.service";
import { MaintenanceVisitService, MaintenanceVisit } from "../../../../core/services/maintenance-visit.service";
import { EquipmentIconComponent } from "../../../../shared/equipment-icon/equipment-icon.component";
import { LabelPipe } from "../../../../core/pipes/label.pipe";
import { BRANCH_CHAINS } from "../../../../core/services/branches.service";
import { EQUIPMENT_CATEGORY_ORDER, equipmentCategory } from "../../../../core/utils/equipment-category";

interface CountEntry {
  label: string;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LabelPipe, EquipmentIconComponent],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.css',
})
export class ReportsDashboardComponent implements OnInit {
  private assetsService = inject(AssetsService);
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);
  private correctiveService = inject(CorrectiveRequestService);
  private visitService = inject(MaintenanceVisitService);

  loading = false;
  errorMessage = '';

  assets: Asset[] = [];
  branches: Branch[] = [];
  users: User[] = [];
  correctiveRequests: CorrectiveRequest[] = [];
  visits: MaintenanceVisit[] = [];

  requestsByStatus: CountEntry[] = [];
  requestsByPriority: CountEntry[] = [];
  visitsByStatus: CountEntry[] = [];
  assetsByStatus: CountEntry[] = [];

  upcomingVisits: MaintenanceVisit[] = [];
  completedVisits: MaintenanceVisit[] = [];

  filterBranchId: number | null = null;
  filterDateFrom = '';
  filterDateTo = '';

  chains = BRANCH_CHAINS;
  categories = EQUIPMENT_CATEGORY_ORDER;
  assetsByType: CountEntry[] = [];
  assetFilterBranchId: number | null = null;
  assetFilterChain = '';
  assetFilterType = '';
  assetFilterRam = '';
  assetFilterProcessor = '';
  assetFilterOs = '';
  assetFilterStatus = '';
  showExportPreview = false;

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      assets: this.assetsService.getAssets(),
      branches: this.branchesService.getBranches(),
      users: this.usersService.getUsers(),
      requests: this.correctiveService.getCorrectiveRequest(),
      visits: this.visitService.getVisits(),
    }).subscribe({
      next: (res) => {
        this.assets = res.assets;
        this.branches = res.branches;
        this.users = res.users;
        this.correctiveRequests = res.requests;
        this.visits = res.visits;

        this.requestsByStatus = this.countBy(this.correctiveRequests, r => r.status);
        this.requestsByPriority = this.countBy(this.correctiveRequests, r => r.priority);
        this.visitsByStatus = this.countBy(this.visits, v => v.status);
        this.assetsByStatus = this.countBy(this.assets, a => a.status);
        this.assetsByType = this.countByType();

        const today = new Date().toISOString().slice(0, 10);
        this.upcomingVisits = this.visits
          .filter(v => v.status !== 'completado' && v.visit_date >= today)
          .sort((a, b) => a.visit_date.localeCompare(b.visit_date))
          .slice(0, 5);

        this.completedVisits = this.visits
          .filter(v => v.status === 'completado')
          .sort((a, b) => b.visit_date.localeCompare(a.visit_date));

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los datos de reportes';
        this.loading = false;
      }
    });
  }

  private countByType(): CountEntry[] {
    const counts = new Map<string, number>();
    for (const a of this.assets) {
      const cat = equipmentCategory(a.type);
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    const max = Math.max(1, ...counts.values());
    return EQUIPMENT_CATEGORY_ORDER
      .map(label => ({ label, count: counts.get(label) || 0, percent: Math.round(((counts.get(label) || 0) / max) * 100) }))
      .filter(e => e.count > 0 || e.label !== 'Otros');
  }

  private countBy<T>(items: T[], keyFn: (item: T) => string): CountEntry[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      const key = keyFn(item);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const total = items.length || 1;
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count, percent: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }

  getAssetName(id: number): string {
    return this.assets.find(a => a.id === id)?.name || 'Desconocido';
  }

  getBranchName(id: number): string {
    return this.branches.find(b => b.id === id)?.name || 'Desconocida';
  }

  getTechnicianName(id: number | null): string {
    if (!id) return 'Sin asignar';
    return this.users.find(u => u.id === id)?.name || 'Desconocido';
  }

  getReasons(raw: string | null): string {
    if (!raw) return '—';
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : '—';
    } catch {
      return raw;
    }
  }

  get filteredCompletedVisits(): MaintenanceVisit[] {
    return this.completedVisits.filter(v => {
      if (this.filterBranchId && v.branch_id !== this.filterBranchId) return false;
      if (this.filterDateFrom && v.visit_date < this.filterDateFrom) return false;
      if (this.filterDateTo && v.visit_date > this.filterDateTo) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.filterBranchId = null;
    this.filterDateFrom = '';
    this.filterDateTo = '';
  }

  get openRequestsCount(): number {
    return this.correctiveRequests.filter(r => r.status !== 'cerrada').length;
  }

  get pendingVisitsCount(): number {
    return this.visits.filter(v => v.status !== 'completado').length;
  }

  get activeBranchesCount(): number {
    return this.branches.filter(b => b.is_active).length;
  }

  get activeUsersCount(): number {
    return this.users.filter(u => u.is_active).length;
  }

  branchChain(branchId: number | null): string {
    return this.branches.find(b => b.id === branchId)?.chain || '';
  }

  get filteredAssets(): Asset[] {
    const ram = this.assetFilterRam.trim().toLowerCase();
    const processor = this.assetFilterProcessor.trim().toLowerCase();
    const os = this.assetFilterOs.trim().toLowerCase();

    return this.assets.filter(a => {
      if (this.assetFilterBranchId && a.branch_id !== this.assetFilterBranchId) return false;
      if (this.assetFilterChain && this.branchChain(a.branch_id) !== this.assetFilterChain) return false;
      if (this.assetFilterStatus && a.status !== this.assetFilterStatus) return false;
      if (this.assetFilterType && equipmentCategory(a.type) !== this.assetFilterType) return false;
      if (ram && !a.ram?.toLowerCase().includes(ram)) return false;
      if (processor && !a.processor?.toLowerCase().includes(processor)) return false;
      if (os && !a.operating_system?.toLowerCase().includes(os)) return false;
      return true;
    });
  }

  openExportPreview(): void {
    this.showExportPreview = true;
  }

  closeExportPreview(): void {
    this.showExportPreview = false;
  }

  clearAssetFilters(): void {
    this.assetFilterBranchId = null;
    this.assetFilterChain = '';
    this.assetFilterType = '';
    this.assetFilterRam = '';
    this.assetFilterProcessor = '';
    this.assetFilterOs = '';
    this.assetFilterStatus = '';
  }

  exportAssetsCsv(): void {
    const headers = ['Nombre', 'Tipo', 'Marca', 'Modelo', 'Serie', 'Procesador', 'RAM', 'Disco', 'Sistema operativo', 'Ubicación', 'Sucursal', 'Cadena', 'Estado'];
    const escape = (value: string | null | undefined): string => {
      const v = (value ?? '').toString().replace(/"/g, '""');
      return `"${v}"`;
    };

    const rows = this.filteredAssets.map(a => [
      a.name, a.type, a.brand, a.model, a.serial_number,
      a.processor, a.ram, a.storage, a.operating_system,
      a.location, this.getBranchName(a.branch_id ?? 0) , this.branchChain(a.branch_id),
      a.status,
    ].map(escape).join(','));

    const csv = '﻿' + [headers.map(escape).join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
