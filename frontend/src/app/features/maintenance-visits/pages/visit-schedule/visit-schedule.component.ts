import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { UsersService, User } from '../../../../core/services/users.service';
import { MaintenanceVisitService } from '../../../../core/services/maintenance-visit.service';

@Component({
  selector: 'app-visit-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visit-schedule.component.html',
  styleUrl: './visit-schedule.component.css',
})
export class VisitScheduleComponent implements OnInit {
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);
  private visitService = inject(MaintenanceVisitService);
  private router = inject(Router);

  branches: Branch[] = [];
  technicians: User[] = [];
  loading = false;
  errorMessage = '';

  form = {
    branch_id: 0,
    technician_id: 0,
    visit_date: '',
    general_observations: '',
  };

  ngOnInit(): void {
    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
    this.usersService.getUsers().subscribe({
      next: res => this.technicians = res.filter(u => u.role === 'tecnico' || u.role === 'admin'),
    });
  }

  submit(): void {
    if (!this.form.branch_id || !this.form.technician_id || !this.form.visit_date) {
      this.errorMessage = 'Selecciona sucursal, técnico y fecha';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.visitService.createVisit({
      branch_id: this.form.branch_id,
      technician_id: this.form.technician_id,
      visit_date: this.form.visit_date,
      general_observations: this.form.general_observations || null,
      status: 'programada',
      items: [],
      checklist_entries: [],
    }).subscribe({
      next: (created) => {
        this.loading = false;
        this.router.navigate(['/maintenance-visits', created.id]);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo programar la visita';
      },
    });
  }
}
