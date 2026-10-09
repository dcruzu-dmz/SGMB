import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../config/api-config";

export interface MaintenanceVisitPhoto {
  id: number;
  file_path: string;
  uploaded_at: string;
}

export interface MaintenanceVisitItem {
  id: number;
  asset_id: number | null;
  equipment_type: string;
  identification_location: string | null;
  serial: string | null;
  installed: boolean | null;
  working: boolean | null;
  cleaning_done: boolean | null;
  notes: string | null;
  photos: MaintenanceVisitPhoto[];
  checklist_entries: MaintenanceVisitChecklistEntry[];
}

export interface MaintenanceVisitItemCreate {
  id?: number;  // al retomar un borrador: con id se actualiza ese equipo, sin id se crea
  asset_id?: number | null;
  equipment_type: string;
  identification_location?: string | null;
  serial?: string | null;
  installed?: boolean | null;
  working?: boolean | null;
  cleaning_done?: boolean | null;
  notes?: string | null;
  checklist_entries?: MaintenanceVisitChecklistEntryCreate[];
}

export interface MaintenanceVisitChecklistEntry {
  id: number;
  category: string;
  label: string;
  checked: boolean;
  comment: string | null;
  item_id: number | null;
}

export interface MaintenanceVisitChecklistEntryCreate {
  id?: number;  // al retomar un borrador: con id se actualiza esa entrada, sin id se crea
  category: string;
  label: string;
  checked: boolean;
  comment?: string | null;
  item_id?: number | null;
}

export interface MaintenanceVisit {
  id: number;
  branch_id: number;
  technician_id: number | null;
  visit_date: string;
  entry_time: string | null;
  exit_time: string | null;
  visit_reasons: string | null;
  equipment_count: number | null;
  thermal_printers_count: number | null;
  matrix_printers_count: number | null;
  branch_contact_name: string | null;
  branch_contact_employee_code: string | null;
  camera_review_by: string | null;
  camera_review_time: string | null;
  equipment_change_previous_serial: string | null;
  equipment_change_previous_brand: string | null;
  equipment_change_new_serial: string | null;
  equipment_change_new_brand: string | null;
  delivered_equipment: string | null;
  delivered_brand: string | null;
  delivered_serial: string | null;
  delivered_model: string | null;
  general_observations: string | null;
  supervisor_observations: string | null;
  signed_report_path: string | null;
  status: string;
  created_at: string;
  items: MaintenanceVisitItem[];
  checklist_entries: MaintenanceVisitChecklistEntry[];
}

export interface MaintenanceVisitCreate {
  branch_id: number;
  technician_id?: number | null;
  visit_date: string;
  entry_time?: string | null;
  exit_time?: string | null;
  visit_reasons?: string | null;
  equipment_count?: number | null;
  thermal_printers_count?: number | null;
  matrix_printers_count?: number | null;
  branch_contact_name?: string | null;
  branch_contact_employee_code?: string | null;
  camera_review_by?: string | null;
  camera_review_time?: string | null;
  equipment_change_previous_serial?: string | null;
  equipment_change_previous_brand?: string | null;
  equipment_change_new_serial?: string | null;
  equipment_change_new_brand?: string | null;
  delivered_equipment?: string | null;
  delivered_brand?: string | null;
  delivered_serial?: string | null;
  delivered_model?: string | null;
  general_observations?: string | null;
  supervisor_observations?: string | null;
  status: string;
  items: MaintenanceVisitItemCreate[];
  checklist_entries: MaintenanceVisitChecklistEntryCreate[];
}

@Injectable({
  providedIn: 'root',
})
export class MaintenanceVisitService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/maintenance-visits`;

  getVisits(): Observable<MaintenanceVisit[]> {
    return this.http.get<MaintenanceVisit[]>(this.apiUrl);
  }

  getVisit(id: number): Observable<MaintenanceVisit> {
    return this.http.get<MaintenanceVisit>(`${this.apiUrl}/${id}`);
  }

  createVisit(data: MaintenanceVisitCreate): Observable<MaintenanceVisit> {
    return this.http.post<MaintenanceVisit>(this.apiUrl, data);
  }

  updateVisit(id: number, data: Partial<MaintenanceVisitCreate>): Observable<MaintenanceVisit> {
    return this.http.put<MaintenanceVisit>(`${this.apiUrl}/${id}`, data);
  }

  deleteVisit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addVisitItem(visitId: number, data: MaintenanceVisitItemCreate): Observable<MaintenanceVisitItem> {
    return this.http.post<MaintenanceVisitItem>(`${this.apiUrl}/${visitId}/items`, data);
  }

  addChecklistEntries(visitId: number, data: MaintenanceVisitChecklistEntryCreate[]): Observable<MaintenanceVisitChecklistEntry[]> {
    return this.http.post<MaintenanceVisitChecklistEntry[]>(`${this.apiUrl}/${visitId}/checklist`, data);
  }

  uploadItemPhotos(itemId: number, files: File[]): Observable<MaintenanceVisitPhoto[]> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post<MaintenanceVisitPhoto[]>(`${this.apiUrl}/items/${itemId}/photos`, formData);
  }

  deletePhoto(photoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/photos/${photoId}`);
  }

  uploadSignedReport(visitId: number, file: File): Observable<MaintenanceVisit> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<MaintenanceVisit>(`${this.apiUrl}/${visitId}/signed-report`, formData);
  }

  deleteSignedReport(visitId: number): Observable<MaintenanceVisit> {
    return this.http.delete<MaintenanceVisit>(`${this.apiUrl}/${visitId}/signed-report`);
  }

  photoUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
  }
}
