import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { forkJoin } from "rxjs";
import { AssetsService, Asset } from "../../../../core/services/assets.service";
import { BranchesService, Branch } from "../../../../core/services/branches.service";
import { UsersService, User } from "../../../../core/services/users.service";
import { CorrectiveRequestService, CorrectiveRequest } from "../../../../core/services/corrective-requests.service";
import { PreventiveMaintenanceService, PreventiveMaintenance } from "../../../../core/services/preventive-maintenance.service";
import { LabelPipe } from "../../../../core/pipes/label.pipe";

interface CountEntry {
  label: string;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, LabelPipe],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.css',
})
export class ReportsDashboardComponent implements OnInit {
  private assetsService = inject(AssetsService);
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);
  private correctiveService = inject(CorrectiveRequestService);
  private preventiveService = inject(PreventiveMaintenanceService);

  loading = false;
  errorMessage = '';

  assets: Asset[] = [];
  branches: Branch[] = [];
  users: User[] = [];
  correctiveRequests: CorrectiveRequest[] = [];
  preventiveMaintenances: PreventiveMaintenance[] = [];

  requestsByStatus: CountEntry[] = [];
  requestsByPriority: CountEntry[] = [];
  preventivesByStatus: CountEntry[] = [];
  assetsByStatus: CountEntry[] = [];

  upcomingPreventives: PreventiveMaintenance[] = [];

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      assets: this.assetsService.getAssets(),
      branches: this.branchesService.getBranches(),
      users: this.usersService.getUsers(),
      requests: this.correctiveService.getCorrectiveRequest(),
      preventives: this.preventiveService.getPreventiveMaintenances(),
    }).subscribe({
      next: (res) => {
        this.assets = res.assets;
        this.branches = res.branches;
        this.users = res.users;
        this.correctiveRequests = res.requests;
        this.preventiveMaintenances = res.preventives;

        this.requestsByStatus = this.countBy(this.correctiveRequests, r => r.status);
        this.requestsByPriority = this.countBy(this.correctiveRequests, r => r.priority);
        this.preventivesByStatus = this.countBy(this.preventiveMaintenances, p => p.status);
        this.assetsByStatus = this.countBy(this.assets, a => a.status);

        const today = new Date().toISOString().slice(0, 10);
        this.upcomingPreventives = this.preventiveMaintenances
          .filter(p => p.status !== 'completado' && p.scheduled_date >= today)
          .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
          .slice(0, 5);

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

  get openRequestsCount(): number {
    return this.correctiveRequests.filter(r => r.status !== 'cerrada').length;
  }

  get pendingPreventivesCount(): number {
    return this.preventiveMaintenances.filter(p => p.status !== 'completado').length;
  }

  get activeBranchesCount(): number {
    return this.branches.filter(b => b.is_active).length;
  }

  get activeUsersCount(): number {
    return this.users.filter(u => u.is_active).length;
  }
}
