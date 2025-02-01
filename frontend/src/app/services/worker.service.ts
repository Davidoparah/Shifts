import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface Shift {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  rate: number;
  location: string;
  status: 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  requirements?: string[];
  dress_code?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  business: {
    id: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private apiUrl = `${environment.apiUrl}/worker_profile`;
  private shiftsUrl = `${environment.apiUrl}/shifts`;

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
    return this.http.get<WorkerProfile>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error fetching worker profile:', error);
          if (error.status === 403) {
            console.error('Access forbidden. Make sure you are logged in as a worker');
          }
          return throwError(() => error);
        })
      );
  }

  updateProfile(data: Partial<WorkerProfile>): Observable<WorkerProfile> {
    return this.http.put<WorkerProfile>(this.apiUrl, data)
      .pipe(
        catchError(error => {
          console.error('Error updating worker profile:', error);
          if (error.status === 403) {
            console.error('Access forbidden. Make sure you are logged in as a worker');
          }
          return throwError(() => error);
        })
      );
  }

  updateAvailability(availability: any): Observable<WorkerProfile> {
    return this.http.put<WorkerProfile>(`${this.apiUrl}/availability`, { availability })
      .pipe(catchError(this.handleError));
  }

  // Shift management
  getAvailableShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.shiftsUrl}/available`)
      .pipe(
        catchError(error => {
          console.error('Error fetching available shifts:', error);
          return throwError(() => error);
        })
      );
  }

  getUpcomingShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.shiftsUrl}/worker`)
      .pipe(
        catchError(error => {
          console.error('Error fetching upcoming shifts:', error);
          return throwError(() => error);
        })
      );
  }

  getCompletedShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.shiftsUrl}/history`)
      .pipe(
        catchError(error => {
          console.error('Error fetching completed shifts:', error);
          return throwError(() => error);
        })
      );
  }

  applyForShift(shiftId: number): Observable<void> {
    return this.http.post<void>(`${this.shiftsUrl}/${shiftId}/apply`, {});
  }

  cancelShift(shiftId: number): Observable<void> {
    return this.http.post<void>(`${this.shiftsUrl}/${shiftId}/cancel`, {});
  }

  startShift(shiftId: number): Observable<void> {
    return this.http.post<void>(`${this.shiftsUrl}/${shiftId}/start`, {});
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
} 