import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaintenanceVisitService, MaintenanceVisit, MaintenanceVisitItem } from '../../../../core/services/maintenance-visit.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { UsersService, User } from '../../../../core/services/users.service';

@Component({
  selector: 'app-visit-print',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './visit-print.component.html',
  styleUrl: './visit-print.component.css',
})
export class VisitPrintComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private visitService = inject(MaintenanceVisitService);
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);

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
    if (!this.visit?.technician_id) return 'Sin asignar';
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

  statusLabel(item: MaintenanceVisitItem, value: boolean | null): string {
    return value === null ? 'N/A' : (value ? 'Sí' : 'No');
  }

  itemSummary(item: MaintenanceVisitItem): string {
    const notes = (item.checklist_entries || [])
      .filter(e => e.comment)
      .map(e => e.comment)
      .join('; ');
    return [item.notes, notes].filter(Boolean).join(' — ') || '—';
  }

  today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  print(): void {
    window.print();
  }
}
