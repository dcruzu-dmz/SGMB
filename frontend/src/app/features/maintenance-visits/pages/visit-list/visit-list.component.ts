import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaintenanceVisitService, MaintenanceVisit } from '../../../../core/services/maintenance-visit.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { UsersService, User } from '../../../../core/services/users.service';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './visit-list.component.html',
  styleUrl: './visit-list.component.css',
})
export class VisitListComponent implements OnInit {
  private visitService = inject(MaintenanceVisitService);
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);

  visits: MaintenanceVisit[] = [];
  branches: Branch[] = [];
  technicians: User[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loading = true;
    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
    this.usersService.getUsers().subscribe({ next: res => this.technicians = res });
    this.visitService.getVisits().subscribe({
      next: res => {
        this.visits = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las visitas';
        this.loading = false;
      },
    });
  }

  getBranchName(id: number): string {
    return this.branches.find(b => b.id === id)?.name || 'Desconocida';
  }

  getTechnicianName(id: number): string {
    return this.technicians.find(t => t.id === id)?.name || 'Desconocido';
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
}
