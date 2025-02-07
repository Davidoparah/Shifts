import { Injectable } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { LoadingService } from '../core/services/loading.service';
import { ToastService } from '../core/services/toast.service';
import { catchError, finalize, tap } from 'rxjs/operators';

export interface Incident {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  status: 'pending' | 'reviewing' | 'resolved';
  severity: 'low' | 'medium' | 'high';
  photos: string[];
  worker_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIncidentDTO {
  title: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  photos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private readonly path = '/incidents';

  constructor(
    private apiService: ApiService,
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {}

  getIncidents(params: any = {}): Observable<Incident[]> {
    return this.apiService.get<Incident[]>(this.path, params).pipe(
      catchError(error => {
        this.toastService.error('Failed to load incidents');
        throw error;
      })
    );
  }

  getIncident(id: string): Observable<Incident> {
    return this.apiService.get<Incident>(`${this.path}/${id}`).pipe(
      catchError(error => {
        this.toastService.error('Failed to load incident details');
        throw error;
      })
    );
  }

  createIncident(incident: CreateIncidentDTO): Observable<Incident> {
    return from(this.loadingService.show('create-incident', 'Creating incident...')).pipe(
      switchMap(() => this.apiService.post<Incident>(this.path, { incident })),
      tap(() => this.toastService.success('Incident reported successfully')),
      catchError(error => {
        this.toastService.error('Failed to create incident');
        throw error;
      }),
      finalize(() => this.loadingService.hide('create-incident'))
    );
  }

  updateIncident(id: string, incident: Partial<Incident>): Observable<Incident> {
    return this.apiService.patch<Incident>(`${this.path}/${id}`, { incident }).pipe(
      tap(() => this.toastService.success('Incident updated successfully')),
      catchError(error => {
        this.toastService.error('Failed to update incident');
        throw error;
      })
    );
  }

  deleteIncident(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.path}/${id}`).pipe(
      tap(() => this.toastService.success('Incident deleted successfully')),
      catchError(error => {
        this.toastService.error('Failed to delete incident');
        throw error;
      })
    );
  }

  uploadPhoto(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file, file.name);

    return this.apiService.post<{ url: string }>(`${this.path}/upload_photo`, formData).pipe(
      catchError(error => {
        this.toastService.error('Failed to upload photo');
        throw error;
      })
    );
  }
} 