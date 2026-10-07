import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-config';

export interface AssignedTask {
  id: number;
  technician_id: number;
  technician_name: string | null;
  branch_id: number;
  branch_name: string | null;
  task_type: string;
  status: string;
  notes: string | null;
  created_by_id: number;
  created_by_name: string | null;
  created_at: string;
  closed_at: string | null;
}

export interface AssignedTaskCreate {
  technician_id: number;
  branch_id: number;
  task_type: string;
  notes?: string | null;
}

// Tipos de tarea soportados hoy. El backend acepta cualquier string, pero
// el frontend solo ofrece estos para mantener consistencia; se puede
// agregar mas aqui sin tocar el modelo ni el backend.
export const TASK_TYPE_INVENTORY = 'inventario_equipos';

export const TASK_TYPE_LABELS: Record<string, string> = {
  [TASK_TYPE_INVENTORY]: 'Actualizar inventario de equipos',
};

@Injectable({ providedIn: 'root' })
export class AssignedTasksService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/assigned-tasks`;

  getTasks(): Observable<AssignedTask[]> {
    return this.http.get<AssignedTask[]>(this.apiUrl);
  }

  createTask(data: AssignedTaskCreate): Observable<AssignedTask> {
    return this.http.post<AssignedTask>(this.apiUrl, data);
  }

  closeTask(id: number): Observable<AssignedTask> {
    return this.http.patch<AssignedTask>(`${this.apiUrl}/${id}/close`, {});
  }
}
