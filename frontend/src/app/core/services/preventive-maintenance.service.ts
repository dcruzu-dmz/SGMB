import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface PreventiveMaintenance {
  id: number,
  asset_id: number,
  responsible_id: number,
  maintenance_type: string,
  frequency: string,
  scheduled_date: string,
  status: string,
  observations: string | null,
  created_at: string,
}

export interface PreventiveMaintenanceCreate {
  asset_id: number,
  responsible_id: number,
  maintenance_type: string,
  frequency: string,
  scheduled_date: string,
  status?: string,
  observations?: string | null,
}

export interface PreventiveMaintenanceUpdate {
  asset_id?: number,
  responsible_id?: number,
  maintenance_type?: string,
  frequency?: string,
  scheduled_date?: string,
  status?: string,
  observations?: string | null,
}

@Injectable({
  providedIn: 'root',
})
export class PreventiveMaintenanceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/preventive';

  getPreventiveMaintenances(): Observable<PreventiveMaintenance[]> {
    return this.http.get<PreventiveMaintenance[]>(this.apiUrl);
  }

  getPreventiveMaintenance(id: number): Observable<PreventiveMaintenance> {
    return this.http.get<PreventiveMaintenance>(`${this.apiUrl}/${id}`);
  }

  createPreventiveMaintenance(data: PreventiveMaintenanceCreate): Observable<PreventiveMaintenance> {
    return this.http.post<PreventiveMaintenance>(this.apiUrl, data);
  }

  updatePreventiveMaintenance(id: number, data: PreventiveMaintenanceUpdate): Observable<PreventiveMaintenance> {
    return this.http.put<PreventiveMaintenance>(`${this.apiUrl}/${id}`, data);
  }

  changeStatus(id: number, status: string): Observable<PreventiveMaintenance> {
    return this.http.patch<PreventiveMaintenance>(`${this.apiUrl}/${id}/?status=${status}`, {});
  }
}
