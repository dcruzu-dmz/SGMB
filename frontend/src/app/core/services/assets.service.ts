import { Injectable, inject } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-config';

export interface Asset {
  id: number;
  name: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  location: string;
  status: string;
  description: string;
  branch_id: number | null;
  created_at: string;
  ram: string | null;
  storage: string | null;
  processor: string | null;
  operating_system: string | null;
}

export interface AssetCreate {
  name: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  location: string;
  status: string;
  description: string;
  branch_id: number | null;
  ram?: string | null;
  storage?: string | null;
  processor?: string | null;
  operating_system?: string | null;
}

export interface AssetUpdate {
  name?: string;
  type?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  location?: string;
  status?: string;
  description?: string;
  branch_id?: number | null;
  ram?: string | null;
  storage?: string | null;
  processor?: string | null;
  operating_system?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/assets`;

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl);
  }

  getAsset_by_id(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.apiUrl}/${id}`);
  }

  createAsset(data: AssetCreate): Observable<Asset> {
    return this.http.post<Asset>(this.apiUrl, data);
  }

  updateAsset(id: number, data: AssetUpdate): Observable<Asset> {
    return this.http.put<Asset>(`${this.apiUrl}/${id}`, data);
  }
  changeStatus(id: number, status: string): Observable<Asset> {
    return this.http.patch<Asset>(`${this.apiUrl}/${id}/?status=${status}`, {});
  }
}