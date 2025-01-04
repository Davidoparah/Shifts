import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './auth.service';

export interface Business {
  _id: string;
  name: string;
  email: string;
  status: string;
  description?: string;
  address?: string;
  phone?: string;
}

export interface Analytics {
  total_users: number;
  total_businesses: number;
  total_shifts: number;
  completed_shifts: number;
  active_users: number;
  active_businesses: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(`${this.apiUrl}/users`);
  }

  getBusinesses(): Observable<{ businesses: Business[] }> {
    return this.http.get<{ businesses: Business[] }>(`${this.apiUrl}/businesses`);
  }

  getAnalytics(): Observable<{ analytics: Analytics }> {
    return this.http.get<{ analytics: Analytics }>(`${this.apiUrl}/analytics`);
  }

  toggleUserStatus(userId: string): Observable<{ user: User }> {
    return this.http.post<{ user: User }>(`${this.apiUrl}/users/${userId}/toggle_status`, {});
  }

  toggleBusinessStatus(businessId: string): Observable<{ business: Business }> {
    return this.http.post<{ business: Business }>(`${this.apiUrl}/businesses/${businessId}/toggle_status`, {});
  }
} 