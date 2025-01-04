import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface IncidentReport {
  id: number;
  shift_id: number;
  reporter_id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved';
  created_at: string;
  photos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getIncidents(shiftId: number): Observable<IncidentReport[]> {
    return this.http.get<IncidentReport[]>(`${this.apiUrl}/shifts/${shiftId}/incident_reports`)
      .pipe(
        catchError(error => {
          console.error('Error fetching incidents:', error);
          return throwError(() => error);
        })
      );
  }

  getIncident(shiftId: number, reportId: number): Observable<IncidentReport> {
    return this.http.get<IncidentReport>(
      `${this.apiUrl}/shifts/${shiftId}/incident_reports/${reportId}`
    ).pipe(
      catchError(error => {
        console.error('Error fetching incident:', error);
        return throwError(() => error);
      })
    );
  }

  createIncident(shiftId: number, report: Partial<IncidentReport>): Observable<IncidentReport> {
    return this.http.post<IncidentReport>(
      `${this.apiUrl}/shifts/${shiftId}/incident_reports`,
      { incident_report: report }
    ).pipe(
      catchError(error => {
        console.error('Error creating incident:', error);
        return throwError(() => error);
      })
    );
  }

  updateIncident(
    shiftId: number,
    reportId: number,
    updates: Partial<IncidentReport>
  ): Observable<IncidentReport> {
    return this.http.patch<IncidentReport>(
      `${this.apiUrl}/shifts/${shiftId}/incident_reports/${reportId}`,
      { incident_report: updates }
    ).pipe(
      catchError(error => {
        console.error('Error updating incident:', error);
        return throwError(() => error);
      })
    );
  }

  addPhoto(shiftId: number, reportId: number, photo: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', photo);

    return this.http.post(
      `${this.apiUrl}/shifts/${shiftId}/incident_reports/${reportId}/add_photo`,
      formData
    ).pipe(
      catchError(error => {
        console.error('Error adding photo:', error);
        return throwError(() => error);
      })
    );
  }
} 