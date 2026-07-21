import { Injectable, inject } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

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
  created_at: string;
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
}

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/assets';

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl);
  }

  getAsset(id: number): Observable<Asset> {
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