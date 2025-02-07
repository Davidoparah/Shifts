import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../core/services/base-http.service';
import { PaginatedResponse } from '../models/common.model';
import { Shift } from '../models/shift.model';

export interface Worker {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  status: string;
  completedShifts: number;
}

export interface WorkerProfile {
  id: string;
  phone: string;
  address: string;
  bio: string;
  hourly_rate: number;
  skills: string[];
  availability: {
    [key: string]: {
      enabled: boolean;
      start_time: string;
      end_time: string;
    };
  };
  rating: number;
  total_shifts: number;
  total_earnings: number;
  completed_shifts: number;
  cancelled_shifts: number;
  average_rating: number;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  documents: {
    id: string;
    type: string;
    status: 'pending' | 'verified' | 'rejected';
    url: string;
    expiry_date?: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    issue_date: string;
    expiry_date?: string;
    verification_url?: string;
  }[];
}

export interface WorkerAvailability {
  weekday: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
}

export interface WorkerDocument {
  id: string;
  type: string;
  file: File;
  expiry_date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkerService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, 'worker');
  }

  getAvailableWorkers(): Observable<Worker[]> {
    return this.get<Worker[]>(this.endpoints['available']);
  }

  getWorkerProfile(id: string): Observable<Worker> {
    return this.get<Worker>(this.buildUrl(this.endpoints['profile'], { id }));
  }

  updateWorkerStatus(id: string, status: string): Observable<Worker> {
    return this.patch<Worker>(this.buildUrl(this.endpoints['profile'], { id }), { status });
  }

  rateWorker(id: string, rating: number, feedback?: string): Observable<Worker> {
    return this.post<Worker>(this.buildUrl(this.endpoints['rate'], { id }), { rating, feedback });
  }

  // Profile Management
  getProfile(): Observable<WorkerProfile> {
    return this.get<WorkerProfile>(this.endpoints['profile']);
  }

  updateProfile(data: Partial<WorkerProfile>): Observable<WorkerProfile> {
    return this.put<WorkerProfile>(this.endpoints['profile'], data);
  }

  updateAvailability(availability: WorkerAvailability[]): Observable<WorkerProfile> {
    return this.put<WorkerProfile>(this.endpoints['availability'], { availability });
  }

  // Document Management
  uploadDocument(document: WorkerDocument): Observable<WorkerProfile> {
    const formData = new FormData();
    formData.append('type', document.type);
    formData.append('file', document.file);
    if (document.expiry_date) {
      formData.append('expiry_date', document.expiry_date);
    }
    return this.post<WorkerProfile>(this.endpoints['documents'], formData);
  }

  deleteDocument(documentId: string): Observable<void> {
    return this.delete<void>(this.buildUrl(this.endpoints['document'], { id: documentId }));
  }

  // Shift Management
  getShifts(params: {
    page?: number;
    per_page?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<PaginatedResponse<Shift>> {
    return this.get<PaginatedResponse<Shift>>(this.endpoints['shifts'], params);
  }

  // Earnings
  getEarnings(params: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Observable<{
    total: number;
    breakdown: Array<{
      period: string;
      amount: number;
      shifts_count: number;
    }>;
  }> {
    return this.get(this.endpoints['earnings'], params);
  }

  // Ratings
  getRatings(params: {
    page?: number;
    per_page?: number;
  }): Observable<PaginatedResponse<{
    id: string;
    rating: number;
    feedback?: string;
    shift_id: string;
    business_name: string;
    created_at: string;
  }>> {
    return this.get(this.endpoints['ratings'], params);
  }
} 