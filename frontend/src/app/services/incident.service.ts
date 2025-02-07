import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/incidents`;

  constructor(private http: HttpClient) {}

  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.apiUrl);
  }

  getIncident(id: string): Observable<Incident> {
    return this.http.get<Incident>(`${this.apiUrl}/${id}`);
  }

  createIncident(incident: CreateIncidentDTO): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, { incident });
  }

  updateIncident(id: string, incident: Partial<Incident>): Observable<Incident> {
    return this.http.patch<Incident>(`${this.apiUrl}/${id}`, { incident });
  }

  deleteIncident(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadPhoto(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file, file.name);

    // Don't set Content-Type header, let the browser set it with the correct boundary
    const headers = new HttpHeaders();
    
    return this.http.post<{ url: string }>(
      `${this.apiUrl}/upload_photo`,
      formData,
      { headers }
    );
  }
} 