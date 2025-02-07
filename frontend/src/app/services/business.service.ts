import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../core/services/base-http.service';
import { PaginatedResponse } from '../models/common.model';
import { Shift } from '../models/shift.model';

export interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  website?: string;
  industry: string;
  company_size: string;
  founded_year?: number;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social_media?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  rating: number;
  total_shifts: number;
  active_shifts: number;
  completed_shifts: number;
  cancelled_shifts: number;
  average_rating: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  subscription_status: 'active' | 'inactive' | 'suspended';
  subscription_plan: string;
  locations: Array<{
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    is_active: boolean;
  }>;
}

export interface BusinessLocation {
  id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_person?: string;
  contact_phone?: string;
  operating_hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  notes?: string;
}

export interface BusinessAnalytics {
  overview: {
    total_shifts: number;
    active_shifts: number;
    completed_shifts: number;
    cancelled_shifts: number;
    total_workers: number;
    average_rating: number;
    total_spent: number;
  };
  shifts_by_status: Array<{
    status: string;
    count: number;
  }>;
  shifts_by_location: Array<{
    location_id: string;
    location_name: string;
    count: number;
  }>;
  earnings_by_period: Array<{
    period: string;
    amount: number;
    shifts_count: number;
  }>;
  top_workers: Array<{
    worker_id: string;
    name: string;
    shifts_count: number;
    average_rating: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, 'business');
  }

  // Profile Management
  getProfile(): Observable<BusinessProfile> {
    return this.get<BusinessProfile>(this.endpoints['profile']);
  }

  updateProfile(data: Partial<BusinessProfile>): Observable<BusinessProfile> {
    return this.put<BusinessProfile>(this.endpoints['profile'], data);
  }

  // Location Management
  getLocations(): Observable<BusinessLocation[]> {
    return this.get<BusinessLocation[]>(this.endpoints['locations']);
  }

  createLocation(location: BusinessLocation): Observable<BusinessLocation> {
    return this.post<BusinessLocation>(this.endpoints['locations'], location);
  }

  updateLocation(id: string, location: Partial<BusinessLocation>): Observable<BusinessLocation> {
    return this.put<BusinessLocation>(this.buildUrl(this.endpoints['location'], { id }), location);
  }

  deleteLocation(id: string): Observable<void> {
    return this.delete<void>(this.buildUrl(this.endpoints['location'], { id }));
  }

  // Shift Management
  getShifts(params: {
    page?: number;
    per_page?: number;
    status?: string;
    location_id?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<PaginatedResponse<Shift>> {
    return this.get<PaginatedResponse<Shift>>(this.endpoints['shifts'], params);
  }

  // Worker Management
  getWorkers(params: {
    page?: number;
    per_page?: number;
    rating?: number;
    skills?: string[];
    availability?: string;
  }): Observable<PaginatedResponse<{
    id: string;
    name: string;
    avatar_url?: string;
    rating: number;
    completed_shifts: number;
    skills: string[];
  }>> {
    return this.get(this.endpoints['workers'], params);
  }

  // Analytics
  getAnalytics(params: {
    start_date?: string;
    end_date?: string;
    location_id?: string;
  }): Observable<BusinessAnalytics> {
    return this.get<BusinessAnalytics>(this.endpoints['analytics'], params);
  }
} 