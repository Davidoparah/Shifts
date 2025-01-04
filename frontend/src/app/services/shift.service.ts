import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Shift {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  rate: number;
  worker?: {
    id: string;
    name: string;
    rating: number;
  };
  completedAt?: string;
  rating?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private apiUrl = `${environment.apiUrl}/api/shifts`;

  constructor(private http: HttpClient) {}

  getBusinessShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/business`);
  }

  getCompletedShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/completed`);
  }

  createShift(shiftData: Partial<Shift>): Observable<Shift> {
    return this.http.post<Shift>(this.apiUrl, shiftData);
  }

  updateShift(id: string, shiftData: Partial<Shift>): Observable<Shift> {
    return this.http.put<Shift>(`${this.apiUrl}/${id}`, shiftData);
  }

  deleteShift(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  completeShift(id: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/${id}/complete`, {});
  }
} 