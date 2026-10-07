import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AssignedTasksService,
  AssignedTask,
  TASK_TYPE_INVENTORY,
  TASK_TYPE_LABELS,
} from '../../../../core/services/assigned-tasks.service';
import { UsersService, User } from '../../../../core/services/users.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { AuthService, CurrentUser } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-assigned-tasks-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './assigned-tasks-list.component.html',
  styleUrl: './assigned-tasks-list.component.css',
})
export class AssignedTasksListComponent implements OnInit {
  private tasksService = inject(AssignedTasksService);
  private usersService = inject(UsersService);
  private branchesService = inject(BranchesService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);

  currentUser: CurrentUser | null = null;
  isAdmin = false;
  tasks: AssignedTask[] = [];
  technicians: User[] = [];
  branches: Branch[] = [];
  loading = false;
  showFormModal = false;
  errorMessage = '';
  page = 1;
  pageSize = 10;

  taskTypeLabels = TASK_TYPE_LABELS;
  taskTypes = Object.keys(TASK_TYPE_LABELS);

  form = {
    technician_id: 0,
    branch_id: 0,
    task_type: TASK_TYPE_INVENTORY,
    notes: '',
  };

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: user => {
        this.currentUser = user;
        this.isAdmin = user.role === 'admin';
      },
    });
    this.loadTasks();
    this.usersService.getUsers().subscribe({
      next: res => this.technicians = res.filter(u => u.role === 'tecnico'),
    });
    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
  }

  loadTasks(): void {
    this.loading = true;
    this.tasksService.getTasks().subscribe({
      next: res => {
        this.tasks = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las tareas asignadas';
        this.loading = false;
      },
    });
  }

  get pagedTasks(): AssignedTask[] {
    const start = (this.page - 1) * this.pageSize;
    return this.tasks.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.page = page;
  }

  taskTypeLabel(type: string): string {
    return this.taskTypeLabels[type] || type;
  }

  openCreateModal(): void {
    this.form = { technician_id: 0, branch_id: 0, task_type: TASK_TYPE_INVENTORY, notes: '' };
    this.errorMessage = '';
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  submitForm(): void {
    if (!this.form.technician_id || !this.form.branch_id) {
      this.errorMessage = 'Selecciona técnico y sucursal';
      return;
    }

    this.tasksService.createTask({
      technician_id: this.form.technician_id,
      branch_id: this.form.branch_id,
      task_type: this.form.task_type,
      notes: this.form.notes || null,
    }).subscribe({
      next: () => {
        this.loadTasks();
        this.closeFormModal();
        this.toast.success('Tarea asignada correctamente');
      },
      error: () => {
        this.errorMessage = 'No se pudo asignar la tarea';
      },
    });
  }

  async closeTask(task: AssignedTask): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Cerrar tarea',
      message: `¿Seguro que deseas cerrar esta autorización de ${task.technician_name} en ${task.branch_name}? Dejará de poder editar equipos ahí.`,
      confirmText: 'Cerrar tarea',
      danger: true,
    });
    if (!confirmed) return;

    this.tasksService.closeTask(task.id).subscribe({
      next: () => {
        this.loadTasks();
        this.toast.success('Tarea cerrada');
      },
      error: () => this.toast.error('No se pudo cerrar la tarea'),
    });
  }

  goToAssets(task: AssignedTask): void {
    this.router.navigate(['/assets'], { queryParams: { branch: task.branch_id } });
  }
}
