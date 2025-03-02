import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { BaseHttpService } from '../core/services/base-http.service';
import { Shift, ShiftApplication, ShiftStatus } from '../models/shift.model';
import { PaginatedResponse } from '../models/common.model';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';
import { environment } from '../../environments/environment';
import { microservicesConfig } from '../core/config/microservices.config';

export interface ShiftParams {
  page?: number;
  per_page?: number;
  status?: string;
  filter?: 'in_progress' | 'completed' | 'upcoming' | 'available';
  start_date?: string;
  end_date?: string;
  business_id?: string;
  worker_id?: string;
  location_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShiftService extends BaseHttpService {
  private apiUrl = microservicesConfig.shift.baseUrl;
  protected override endpoints = microservicesConfig.shift.endpoints;

  constructor(
    http: HttpClient,
    private authService: AuthService
  ) {
    super(http, 'shift');
    console.log('ShiftService initialized with baseUrl:', this.apiUrl);
    console.log('ShiftService endpoints:', this.endpoints);
  }

  private formatShift(shift: Shift): Shift {
    return {
      ...shift,
      start_time: new Date(shift.start_time).toISOString(),
      end_time: new Date(shift.end_time).toISOString(),
      check_in_time: shift.check_in_time ? new Date(shift.check_in_time).toISOString() : undefined,
      check_out_time: shift.check_out_time ? new Date(shift.check_out_time).toISOString() : undefined,
      created_at: new Date(shift.created_at).toISOString(),
      updated_at: new Date(shift.updated_at).toISOString()
    };
  }

  getShifts(params: any = {}): Observable<PaginatedResponse<Shift>> {
    console.log('Getting shifts with params:', params);
    return this.authService.currentUser.pipe(
      tap(currentUser => console.log('Current user in getShifts:', currentUser)),
      switchMap(currentUser => {
        return this.http.get<PaginatedResponse<Shift>>(`${this.apiUrl}${this.endpoints.list}`, { params }).pipe(
          tap(response => {
            console.log('Shifts response:', response);
            if (response.data) {
              response.data = response.data.map(shift => ({
                ...shift,
                has_applied: shift.applications?.some(app => 
                  app.worker_profile_id === currentUser?.worker_profile?.id
                ) || shift.worker_profile_id === currentUser?.worker_profile?.id
              }));
            }
          }),
          catchError(error => {
            console.error('Error fetching shifts:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  getShift(id: string): Observable<Shift> {
    return this.get<Shift>(this.buildUrl(this.endpoints['update'], { id }))
      .pipe(map(shift => this.formatShift(shift)));
  }

  createShift(shift: Partial<Shift>): Observable<Shift> {
    return this.post<Shift>(this.endpoints['create'], shift)
      .pipe(map(shift => this.formatShift(shift)));
  }

  updateShift(id: string, shift: Partial<Shift>): Observable<Shift> {
    return this.put<Shift>(this.buildUrl(this.endpoints['update'], { id }), shift)
      .pipe(map(shift => this.formatShift(shift)));
  }

  deleteShift(id: string): Observable<any> {
    return this.delete(this.buildUrl(this.endpoints['delete'], { id }))
      .pipe(
        map(response => {
          console.log('Shift deleted:', response);
          return response;
        })
      );
  }

  getAvailableShifts(params: any = {}): Observable<PaginatedResponse<Shift>> {
    console.log('Getting available shifts with params:', params);
    return this.authService.currentUser.pipe(
      tap(currentUser => {
        console.log('Current user in getAvailableShifts:', currentUser);
        console.log('Worker profile:', currentUser?.worker_profile);
      }),
      switchMap(currentUser => {
        const workerProfileId = currentUser?.worker_profile?.id;
        console.log('Worker profile ID:', workerProfileId);

        if (!workerProfileId) {
          console.warn('No worker profile found for available shifts');
        }

        return this.http.get<PaginatedResponse<Shift>>(`${this.apiUrl}${this.endpoints.available}`, { 
          params: {
            ...params,
            worker_profile_id: workerProfileId
          }
        }).pipe(
          tap(response => {
            console.log('Available shifts response:', response);
            if (response.data) {
              response.data = response.data.map(shift => {
                const hasApplied = shift.applications?.some(app => 
                  app.worker_profile_id === workerProfileId
                );
                console.log(`Shift ${shift.id} - Has applied: ${hasApplied}`);
                return {
                  ...shift,
                  has_applied: hasApplied
                };
              });
            }
          }),
          catchError(error => {
            console.error('Error fetching available shifts:', error);
            console.error('Error details:', {
              status: error.status,
              message: error.message,
              error: error.error
            });
            return throwError(() => error);
          })
        );
      })
    );
  }

  applyForShift(shiftId: string): Observable<Shift> {
    console.log('Starting shift application process for shift:', shiftId);
    
    // First, get the current shift status
    return this.getShift(shiftId).pipe(
      tap(shift => {
        console.log('Current shift status before application:', {
          id: shift.id,
          status: shift.status,
          worker_profile_id: shift.worker_profile_id,
          start_time: shift.start_time
        });
      }),
      switchMap(shift => this.authService.currentUser.pipe(
        tap(currentUser => {
          console.log('Current user in applyForShift:', currentUser);
          console.log('Worker profile:', currentUser?.worker_profile);
        }),
        switchMap(currentUser => {
          const workerProfileId = currentUser?.worker_profile?.id;
          console.log('Worker profile ID:', workerProfileId);

          if (!workerProfileId) {
            console.error('No worker profile found when applying for shift');
            return throwError(() => new Error('No worker profile found. Please complete your profile before applying for shifts.'));
          }
          
          return this.http.post<Shift>(`${this.apiUrl}${this.endpoints.apply.replace(':id', shiftId)}`, {
            worker_profile_id: workerProfileId
          }).pipe(
            tap(response => {
              console.log('Applied for shift - Response details:', {
                id: response.id,
                previousStatus: shift.status,
                newStatus: response.status,
                previousWorkerId: shift.worker_profile_id,
                newWorkerId: response.worker_profile_id,
                start_time: response.start_time,
                applications: response.applications
              });
              
              // Immediately verify the shift status
              this.getShift(shiftId).subscribe(updatedShift => {
                console.log('Shift status verification:', {
                  id: updatedShift.id,
                  status: updatedShift.status,
                  worker_profile_id: updatedShift.worker_profile_id,
                  start_time: updatedShift.start_time
                });
              });
              
              // Verify worker shifts
              this.getWorkerShifts({ filter: 'upcoming' }).subscribe(shifts => {
                console.log('Worker shifts after application:', {
                  total: shifts.data.length,
                  shifts: shifts.data.map(s => ({
                    id: s.id,
                    status: s.status,
                    worker_profile_id: s.worker_profile_id,
                    start_time: s.start_time
                  }))
                });
              });
            }),
            catchError(error => {
              console.error('Error applying for shift:', error);
              console.error('Error details:', {
                status: error.status,
                message: error.message,
                error: error.error
              });
              
              let errorMessage = 'Failed to apply for shift';
              if (error.error?.message) {
                errorMessage = error.error.message;
              } else if (error.error?.errors) {
                errorMessage = Array.isArray(error.error.errors) 
                  ? error.error.errors.join(', ') 
                  : error.error.errors;
              }
              
              return throwError(() => new Error(errorMessage));
            })
          );
        })
      ))
    );
  }

  getShiftApplications(shiftId: string): Observable<ShiftApplication[]> {
    return this.http.get<{ applications: ShiftApplication[] }>(`${this.apiUrl}/${shiftId}/applications`).pipe(
      map(response => response.applications),
      catchError(error => {
        console.error('Error fetching shift applications:', error);
        return throwError(() => error);
      })
    );
  }

  startShift(shiftId: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/${shiftId}/start`, {}).pipe(
      tap(response => {
        console.log('Started shift:', response);
      }),
      catchError(error => {
        console.error('Error starting shift:', error);
        return throwError(() => error);
      })
    );
  }

  completeShift(shiftId: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/${shiftId}/complete`, {}).pipe(
      tap(response => {
        console.log('Completed shift:', response);
      }),
      catchError(error => {
        console.error('Error completing shift:', error);
        return throwError(() => error);
      })
    );
  }

  cancelShift(shiftId: string, reason?: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/${shiftId}/cancel`, { reason }).pipe(
      tap(response => {
        console.log('Cancelled shift:', response);
      }),
      catchError(error => {
        console.error('Error cancelling shift:', error);
        return throwError(() => error);
      })
    );
  }

  getWorkerShifts(params: any = {}): Observable<PaginatedResponse<Shift>> {
    console.log('Getting worker shifts with params:', params);
    return this.authService.currentUser.pipe(
      tap(currentUser => {
        console.log('Current user in getWorkerShifts:', currentUser);
        console.log('Worker profile:', currentUser?.worker_profile);
      }),
      switchMap(currentUser => {
        const workerProfileId = currentUser?.worker_profile?.id;
        console.log('Worker profile ID:', workerProfileId);

        if (!workerProfileId) {
          console.warn('No worker profile found');
          return of({
            data: [],
            meta: {
              current_page: 1,
              total_pages: 0,
              total_count: 0,
              per_page: 20
            }
          });
        }

        // Prepare request parameters
        const requestParams = {
          ...params,
          worker_profile_id: workerProfileId,
          include_applications: true,
          filter: params.filter || 'upcoming'
        };

        console.log('Final request params for worker shifts:', requestParams);

        return this.http.get<PaginatedResponse<Shift>>(`${this.apiUrl}${this.endpoints['worker-shifts']}`, {
          params: requestParams
        }).pipe(
          tap(response => {
            console.log('Raw worker shifts response:', response);
            if (response.data) {
              response.data = response.data.map(shift => ({
                ...shift,
                has_applied: shift.applications?.some(app => 
                  app.worker_profile_id === workerProfileId
                ) || shift.worker_profile_id === workerProfileId
              }));
              console.log('Processed worker shifts:', response.data);
            }
          }),
          catchError(error => {
            console.error('Error fetching worker shifts:', error);
            console.error('Error details:', {
              status: error?.status,
              message: error?.message,
              error: error?.error
            });
            return throwError(() => error);
          })
        );
      })
    );
  }

  getCurrentWorkerProfileId(): string | undefined {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.worker_profile?.id;
  }
} 