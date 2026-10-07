import { EquipmentIconComponent } from '../../../../shared/equipment-icon/equipment-icon.component';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaintenanceVisitService, MaintenanceVisit, MaintenanceVisitItem } from '../../../../core/services/maintenance-visit.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { UsersService, User } from '../../../../core/services/users.service';
import { groupByEquipmentCategory } from '../../../../core/utils/equipment-category';

@Component({
  selector: 'app-visit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, EquipmentIconComponent],
  templateUrl: './visit-detail.component.html',
  styleUrl: './visit-detail.component.css',
})
export class VisitDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private visitService = inject(MaintenanceVisitService);
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);

  categoryTitles: Record<string, string> = {
    revision: 'Revisión',
    compartido: 'Recursos compartidos',
  };
  categories = ['revision', 'compartido'];

  visit: MaintenanceVisit | null = null;
  branches: Branch[] = [];
  technicians: User[] = [];
  loading = false;
  errorMessage = '';
  uploadingReport = false;
  reportErrorMessage = '';

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

  get groupedItems(): { category: string; items: MaintenanceVisitItem[] }[] {
    return groupByEquipmentCategory(this.visit?.items || [], i => i.equipment_type);
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
    return this.visit?.checklist_entries.filter(e => e.category === category && !e.item_id) || [];
  }

  itemEntriesByCategory(item: MaintenanceVisitItem, category: string) {
    return item.checklist_entries.filter(e => e.category === category);
  }

  photoUrl(path: string): string {
    return this.visitService.photoUrl(path);
  }

  onSignedReportSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.visit) return;

    this.uploadingReport = true;
    this.reportErrorMessage = '';
    this.visitService.uploadSignedReport(this.visit.id, file).subscribe({
      next: (updated) => {
        this.visit = updated;
        this.uploadingReport = false;
        input.value = '';
      },
      error: () => {
        this.reportErrorMessage = 'No se pudo subir la hoja firmada';
        this.uploadingReport = false;
        input.value = '';
      },
    });
  }

  removeSignedReport(): void {
    if (!this.visit) return;
    this.visitService.deleteSignedReport(this.visit.id).subscribe({
      next: (updated) => this.visit = updated,
      error: () => this.reportErrorMessage = 'No se pudo eliminar la hoja firmada',
    });
  }
}
