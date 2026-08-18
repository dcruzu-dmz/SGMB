import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaintenanceVisitService, MaintenanceVisit } from '../../../../core/services/maintenance-visit.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { UsersService, User } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SearchService } from '../../../../core/services/search.service';

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
  private authService = inject(AuthService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);

  visits: MaintenanceVisit[] = [];
  branches: Branch[] = [];
  technicians: User[] = [];
  loading = false;
  errorMessage = '';
  isAdmin = false;
  searchTerm = '';

  ngOnInit(): void {
    this.loading = true;
    this.authService.getMe().subscribe({ next: res => this.isAdmin = res.role === 'admin' });
    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
    this.usersService.getUsers().subscribe({ next: res => this.technicians = res });
    this.searchService.term.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(term => this.searchTerm = term);
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

  get visibleVisits(): MaintenanceVisit[] {
    if (!this.searchTerm) return this.visits;
    return this.visits.filter(v =>
      this.getBranchName(v.branch_id).toLowerCase().includes(this.searchTerm) ||
      this.getTechnicianName(v.technician_id).toLowerCase().includes(this.searchTerm) ||
      this.getReasons(v.visit_reasons).toLowerCase().includes(this.searchTerm)
    );
  }

  getBranchName(id: number): string {
    return this.branches.find(b => b.id === id)?.name || 'Desconocida';
  }

  getTechnicianName(id: number | null): string {
    if (!id) return 'Sin asignar';
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
