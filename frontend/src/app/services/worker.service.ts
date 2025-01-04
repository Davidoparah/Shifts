import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Worker {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  status: string;
  completedShifts: number;
}

export interface WorkerProfile extends Worker {
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  skills: string[];
  time_slots?: {
    [key: string]: Array<{ start: string; end: string }>;
  };
}

export interface Shift {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  rate: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private apiUrl = `${environment.apiUrl}/api/workers`;

  constructor(private http: HttpClient) {}

  getAvailableWorkers(): Observable<Worker[]> {
    return this.http.get<Worker[]>(`${this.apiUrl}/available`);
  }

  getWorkerProfile(id: string): Observable<Worker> {
    return this.http.get<Worker>(`${this.apiUrl}/${id}`);
  }

  updateWorkerStatus(id: string, status: string): Observable<Worker> {
    return this.http.patch<Worker>(`${this.apiUrl}/${id}/status`, { status });
  }

  rateWorker(id: string, rating: number, feedback?: string): Observable<Worker> {
    return this.http.post<Worker>(`${this.apiUrl}/${id}/rate`, { rating, feedback });
  }

  // Profile management
  getProfile(): Observable<WorkerProfile> {
    return this.http.get<WorkerProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<WorkerProfile>): Observable<WorkerProfile> {
    return this.http.put<WorkerProfile>(`${this.apiUrl}/profile`, data);
  }

  updateAvailability(timeSlots: { [key: string]: Array<{ start: string; end: string }> }): Observable<WorkerProfile> {
    return this.http.put<WorkerProfile>(`${this.apiUrl}/availability`, { time_slots: timeSlots });
  }

  // Shift management
  getAvailableShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/shifts/available`);
  }

  getUpcomingShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/shifts/upcoming`);
  }

  getCompletedShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/shifts/completed`);
  }

  applyForShift(shiftId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/shifts/${shiftId}/apply`, {});
  }

  cancelShift(shiftId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/shifts/${shiftId}/cancel`, {});
  }

  startShift(shiftId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/shifts/${shiftId}/start`, {});
  }
} 