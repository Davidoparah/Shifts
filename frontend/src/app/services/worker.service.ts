import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { BaseHttpService } from '../core/services/base-http.service';
import { PaginatedResponse } from '../models/common.model';
import { Shift } from '../models/shift.model';
import { WorkerProfile } from '../core/models/user.model';
import { AuthService } from '../core/services/auth.service';
import { microservicesConfig } from '../core/config/microservices.config';

export interface Worker {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  status: string;
  completedShifts: number;
}

export interface WorkerAvailability {
  weekday: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
}

export interface WorkerDocument {
  id?: string;
  type: string;
  file: File;
  file_url?: string;
  expiry_date?: string;
  status?: 'pending' | 'uploaded' | 'expired';
}

export interface DocumentUploadResponse {
  id: string;
  type: string;
  file_url: string;
  expiry_date: string | null;
  status: 'uploaded';
}

export interface WorkerProfileResponse {
  user: any;
  worker_profile: WorkerProfile | null;
}

@Injectable({
  providedIn: 'root'
})
export class WorkerService extends BaseHttpService {
  private apiUrl = microservicesConfig.worker.baseUrl;
  protected override endpoints = {
    ...microservicesConfig.worker.endpoints,
    // Additional endpoints not in microservices config
    available: '/workers/available',
    rate: '/workers/:id/rate',
    documents: '/worker_profile/documents',
    document: '/worker_profile/documents/:id',
    photo: '/worker_profile/photo'
  };

  constructor(
    http: HttpClient,
    private authService: AuthService
  ) {
    super(http, 'worker');
    console.log('WorkerService initialized with baseUrl:', this.apiUrl);
    console.log('WorkerService endpoints:', this.endpoints);
    // Load profile on service initialization
    this.loadProfile().subscribe({
      next: (response) => console.log('Initial profile load response:', response),
      error: (error) => console.error('Initial profile load error:', error)
    });
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
  getProfile(): Observable<WorkerProfileResponse> {
    console.log('Getting worker profile');
    return this.get<any>(this.endpoints.profile).pipe(
      tap(response => {
        console.log('Worker profile response:', response);
        // Update auth state when profile is fetched
        const currentUser = this.authService.getCurrentUser();
        console.log('Current user before update:', currentUser);
        
        if (currentUser) {
          // Create worker profile from response if it's a direct profile response
          const workerProfile: WorkerProfile = response.worker_profile || {
            id: response._id,
            user_id: response.user_id || currentUser.id,
            status: response.status || 'active',
            phone: response.phone,
            address: response.address,
            bio: response.bio,
            hourly_rate: response.hourly_rate,
            skills: response.skills || [],
            availability: response.availability || {}
          };
          
          console.log('Constructed worker profile:', workerProfile);
          const updatedUser = {
            ...currentUser,
            worker_profile: workerProfile
          };
          console.log('Updated user object:', updatedUser);
          this.authService.updateCurrentUser(updatedUser);
        }
      }),
      map(response => {
        if (response.worker_profile) {
          return response as WorkerProfileResponse;
        }
        
        // Convert direct profile response to WorkerProfileResponse format
        const workerProfile: WorkerProfile = {
          id: response._id,
          user_id: response.user_id,
          status: response.status || 'active',
          phone: response.phone,
          address: response.address,
          bio: response.bio,
          hourly_rate: response.hourly_rate,
          skills: response.skills || [],
          availability: response.availability || {}
        };
        
        return {
          user: null,
          worker_profile: workerProfile
        };
      }),
      catchError(error => {
        console.error('Error fetching worker profile:', error);
        if (error.status === 404) {
          console.log('Profile not found, returning empty response');
          return of({ user: null, worker_profile: null });
        }
        throw error;
      })
    );
  }

  loadProfile(): Observable<WorkerProfileResponse> {
    const currentUser = this.authService.getCurrentUser();
    console.log('Loading profile for current user:', currentUser);
    
    if (!currentUser) {
      console.log('No current user, skipping profile load');
      return of({ user: null, worker_profile: null });
    }
    
    return this.getProfile();
  }

  updateProfile(profile: Partial<WorkerProfile>): Observable<WorkerProfileResponse> {
    console.log('Updating worker profile with data:', profile);
    return this.put<WorkerProfileResponse>(this.endpoints.profile, profile).pipe(
      tap(response => {
        console.log('Profile update response:', response);
        const currentUser = this.authService.getCurrentUser();
        console.log('Current user before profile update:', currentUser);
        
        if (currentUser && response.worker_profile) {
          const updatedUser = {
            ...currentUser,
            worker_profile: response.worker_profile
          };
          console.log('Updating current user with:', updatedUser);
          this.authService.updateCurrentUser(updatedUser);
        } else {
          console.warn('Invalid profile update response:', response);
        }
      }),
      catchError(error => {
        console.error('Error updating worker profile:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        throw error;
      })
    );
  }

  updateAvailability(availability: WorkerAvailability[]): Observable<WorkerProfile> {
    return this.put<WorkerProfile>(this.endpoints['availability'], { availability });
  }

  // Document Management
  uploadDocument(type: string, file: File, expiryDate?: string): Observable<DocumentUploadResponse> {
    console.log('Uploading document:', { type, file, expiryDate });
    
    const formData = new FormData();
    formData.append('document[type]', type);
    formData.append('document[file]', file);
    if (expiryDate) {
      formData.append('document[expiry_date]', expiryDate);
    }

    const url = `${this.apiUrl}${this.endpoints.documents}`;
    console.log('Using upload URL:', url);
    console.log('FormData contents:', formData);

    return this.http.post<DocumentUploadResponse>(url, formData).pipe(
      tap(response => console.log('Upload response:', response)),
      catchError(error => {
        console.error('Error uploading document:', error);
        return throwError(() => error);
      })
    );
  }

  deleteDocument(type: string): Observable<void> {
    const url = `${this.apiUrl}${this.endpoints.documents}/${type}`;
    console.log('Deleting document:', { type, url });
    return this.http.delete<void>(url).pipe(
      tap(() => console.log('Document deleted successfully')),
      catchError(error => {
        console.error('Error deleting document:', error);
        return throwError(() => error);
      })
    );
  }

  getDocuments(): Observable<WorkerDocument[]> {
    const url = `${this.apiUrl}${this.endpoints.documents}`;
    console.log('Fetching worker documents from:', url);
    return this.http.get<WorkerDocument[]>(url).pipe(
      tap(documents => console.log('Retrieved documents:', documents)),
      catchError(error => {
        console.error('Error fetching documents:', error);
        return throwError(() => error);
      })
    );
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

  updateProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(this.endpoints.photo, formData);
  }
} 