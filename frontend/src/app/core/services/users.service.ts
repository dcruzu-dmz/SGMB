import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-config';

export interface User {
  id: number;
  name: string;
  email: string | null;  // null cuando quien consulta no es admin
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: string;
  is_active: boolean;
}

export interface UserUpdate {
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(data: UserCreate): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }

  updateUser(id: number, data: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  changeStatus(id: number, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/status?is_active=${isActive}`, {});
  }

  resetPassword(id: number, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/password`, { new_password: newPassword });
  }
}