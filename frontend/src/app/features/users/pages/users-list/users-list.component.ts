import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User, UserCreate, UserUpdate } from '../../../../core/services/users.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, PaginationComponent],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  private usersService = inject(UsersService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  users: User[] = [];
  loading = false;
  errorMessage = '';
  page = 1;
  pageSize = 10;

  isEditing = false;
  selectedUserId: number | null = null;
  showFormModal = false;

  form = {
    name: '',
    email: '',
    password: '',
    role: 'tecnico',
    is_active: true
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  get pagedUsers(): User[] {
    const start = (this.page - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.page = page;
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los usuarios';
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.form = {
      name: '',
      email: '',
      password: '',
      role: 'tecnico',
      is_active: true
    };
    this.isEditing = false;
    this.selectedUserId = null;
    this.errorMessage = '';
  }

  openCreateModal(): void {
    this.resetForm();
    this.showFormModal = true;
  }

  openEditModal(user: User): void {
    this.editUser(user);
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  submitForm(): void {
    if (this.isEditing && this.selectedUserId !== null) {
      const updateData: UserUpdate = {
        name: this.form.name,
        email: this.form.email,
        role: this.form.role,
        is_active: this.form.is_active
      };

      this.usersService.updateUser(this.selectedUserId, updateData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeFormModal();
          this.toast.success('Usuario actualizado correctamente');
        },
        error: (err) => {
          this.errorMessage = err?.error?.detail || 'No se pudo actualizar el usuario';
        }
      });

      return;
    }

    if (this.form.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    const createData: UserCreate = {
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      role: this.form.role,
      is_active: this.form.is_active
    };

    this.usersService.createUser(createData).subscribe({
      next: () => {
        this.loadUsers();
        this.closeFormModal();
        this.toast.success('Usuario creado correctamente');
      },
      error: (err) => {
        this.errorMessage = err?.error?.detail || 'No se pudo crear el usuario';
      }
    });
  }

  editUser(user: User): void {
    this.isEditing = true;
    this.selectedUserId = user.id;

    this.form.name = user.name;
    this.form.email = user.email;
    this.form.password = '';
    this.form.role = user.role;
    this.form.is_active = user.is_active;
  }

  async toggleStatus(user: User): Promise<void> {
    const activating = !user.is_active;

    if (!activating) {
      const confirmed = await this.confirmService.confirm({
        title: 'Desactivar usuario',
        message: `¿Seguro que deseas desactivar a ${user.name}? Podrás reactivarlo cuando quieras.`,
        confirmText: 'Desactivar',
        danger: true,
      });
      if (!confirmed) return;
    }

    this.usersService.changeStatus(user.id, activating).subscribe({
      next: () => {
        this.loadUsers();
        this.toast.success(activating ? 'Usuario activado' : 'Usuario desactivado');
      },
      error: () => {
        this.toast.error('No se pudo cambiar el estado del usuario');
      }
    });
  }
}