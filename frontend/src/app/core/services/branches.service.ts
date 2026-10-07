import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-config';

export const BRANCH_CHAINS = ['Bodega Farmacéutica', 'Meykos', 'Cruz Verde', 'Farmacias del Ahorro'];

export interface Branch {
  id: number,
  name: string,
  address: string,
  phone: string,
  chain: string | null,
  is_active: boolean,
  maintenance_frequency_days: number | null,
  created_at: string,
}

export interface BranchCreate {
  name: string,
  address?: string,
  phone?: string,
  chain?: string | null,
  is_active?: boolean,
  maintenance_frequency_days?: number | null,
}

export interface BranchUpdate {
  name?: string,
  address?: string,
  phone?: string,
  chain?: string | null,
  is_active?: boolean,
  maintenance_frequency_days?: number | null,
}

@Injectable({
  providedIn: 'root',
})
export class BranchesService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/branches`;

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.apiUrl);
  }

  getBranch(id: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/${id}`);
  }

  createBranch(data: BranchCreate): Observable<Branch> {
    return this.http.post<Branch>(this.apiUrl, data);
  }

  updateBranch(id: number, data: BranchUpdate): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/${id}`, data);
  }

  changeBranchStatus(id: number, isActive: boolean): Observable<Branch> {
  return this.http.patch<Branch>(`${this.apiUrl}/${id}/status?is_active=${isActive}`, {});
}
}
