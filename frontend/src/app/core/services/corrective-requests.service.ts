import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface CorrectiveRequest {
  id: number,
  asset_id: number,
  requester_id: number,
  assigned_id: number,
  description: string,
  priority: string,
  status: string,
  solution: string | null,
  created_at: string,
  closed_at: string | null,
}

export interface CorrectiveRequestCreate{
  asset_id: number,
  requester_id: number,
  assigned_id?: number | null,
  description: string,
  priority: string,
  status? : string,
}

export interface CorrectiveRequestUpdate{
  asset_id?: number,
  requester_id?: number,
  assigned_id?: number | null,
  description?: string,
  priority?: string,
  status? : string,
  solution?: string | null,
}

@Injectable({
  providedIn: 'root',
})
export class CorrectiveRequestService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/correctiverequest';

  getCorrectiveRequest(): Observable<CorrectiveRequest[]> {
    return this.http.get<CorrectiveRequest[]>(this.apiUrl);
  }
  getCorrectiveRequest_by_id(id: number): Observable<CorrectiveRequest> {
    return this.http.get<CorrectiveRequest>(`${this.apiUrl}/${id}`);
  }
  createCorrectiveRequest(data: CorrectiveRequestCreate): Observable<CorrectiveRequest>{
    return this.http.post<CorrectiveRequest>(this.apiUrl, data);
  }
  updateCorrectiveRequest(id: number, data:CorrectiveRequestUpdate): Observable<CorrectiveRequest>{
    return this.http.put<CorrectiveRequest>(`${this.apiUrl}/${id}`, data);
  }
  changeStatus(id: number, status: string): Observable<CorrectiveRequest>{
    return this.http.patch<CorrectiveRequest>(`${this.apiUrl}/${id}/?status=${status}`,{});
  }

}