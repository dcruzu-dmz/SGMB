import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaintenanceVisitService, MaintenanceVisit } from '../../../../core/services/maintenance-visit.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { UsersService, User } from '../../../../core/services/users.service';

@Component({
  selector: 'app-visit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './visit-detail.component.html',
  styleUrl: './visit-detail.component.css',
})
export class VisitDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private visitService = inject(MaintenanceVisitService);
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);

  categoryTitles: Record<string, string> = {
    limpieza: 'Limpieza',
    software: 'Software / Aplicaciones instaladas',
    revision: 'Revisión',
    compartido: 'Recursos compartidos',
  };
  categories = ['limpieza', 'software', 'revision', 'compartido'];

  visit: MaintenanceVisit | null = null;
  branches: Branch[] = [];
  technicians: User[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
    this.usersService.getUsers().subscribe({ next: res => this.technicians = res });

    this.visitService.getVisit(id).subscribe({
      next: res => {
        this.visit = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la visita';
        this.loading = false;
      },
    });
  }

  get branchName(): string {
    return this.branches.find(b => b.id === this.visit?.branch_id)?.name || '—';
  }

  get technicianName(): string {
    return this.technicians.find(t => t.id === this.visit?.technician_id)?.name || '—';
  }

  get reasons(): string[] {
    if (!this.visit?.visit_reasons) return [];
    try {
      const parsed = JSON.parse(this.visit.visit_reasons);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  checklistByCategory(category: string) {
    return this.visit?.checklist_entries.filter(e => e.category === category) || [];
  }

  photoUrl(path: string): string {
    return this.visitService.photoUrl(path);
  }
}
