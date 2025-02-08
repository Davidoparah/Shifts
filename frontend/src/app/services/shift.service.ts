import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../core/services/base-http.service';
import { Shift, ShiftApplication, ShiftStatus } from '../models/shift.model';
import { PaginatedResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ShiftService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, 'shift');
  }

  getShifts(params: {
    page?: number;
    per_page?: number;
    status?: ShiftStatus;
    location_id?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<PaginatedResponse<Shift>> {
    return this.get<PaginatedResponse<Shift>>(this.endpoints['list'], params);
  }

  getShift(id: string): Observable<Shift> {
    return this.get<Shift>(this.buildUrl(this.endpoints['update'], { id }));
  }

  createShift(shift: Partial<Shift>): Observable<Shift> {
    return this.post<Shift>(this.endpoints['create'], shift);
  }

  updateShift(id: string, shift: Partial<Shift>): Observable<Shift> {
    return this.put<Shift>(this.buildUrl(this.endpoints['update'], { id }), shift);
  }

  deleteShift(id: string): Observable<void> {
    return this.delete<void>(this.buildUrl(this.endpoints['delete'], { id }));
  }

  getAvailableShifts(params: {
    page?: number;
    per_page?: number;
    location_id?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<PaginatedResponse<Shift>> {
    return this.get<PaginatedResponse<Shift>>(this.endpoints['available'], params);
  }

  applyToShift(id: string, application: ShiftApplication): Observable<Shift> {
    return this.post<Shift>(this.buildUrl(this.endpoints['apply'], { id }), application);
  }

  startShift(id: string): Observable<Shift> {
    return this.post<Shift>(this.buildUrl(this.endpoints['start'], { id }), {});
  }

  getWorkerShifts(params?: {
    page?: number;
    per_page?: number;
    status?: ShiftStatus;
    filter?: 'upcoming' | 'completed' | 'in_progress' | 'available';
    start_date?: string;
    end_date?: string;
  }): Observable<PaginatedResponse<Shift>> {
    const { filter, ...otherParams } = params || {};
    return this.get<PaginatedResponse<Shift>>(this.endpoints['list'], { ...otherParams, filter });
  }

  completeShift(id: string, data: { notes?: string } = {}): Observable<Shift> {
    return this.post<Shift>(this.buildUrl(this.endpoints['complete'], { id }), data);
  }

  cancelShift(id: string, data: { reason: string }): Observable<Shift> {
    return this.post<Shift>(this.buildUrl(this.endpoints['cancel'], { id }), data);
  }
} 