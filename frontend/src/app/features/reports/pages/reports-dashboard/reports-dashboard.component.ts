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
import { LabelPipe } from "../../../../core/pipes/label.pipe";

interface CountEntry {
  label: string;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LabelPipe],
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
}
