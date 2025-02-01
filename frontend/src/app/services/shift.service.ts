import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Shift } from '../models/shift.model';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private apiUrl = `${environment.apiUrl}/shifts`;

  constructor(private http: HttpClient) {}

  getShifts(page: number = 1, perPage: number = 20): Observable<PaginatedResponse<Shift>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedResponse<Shift>>(this.apiUrl, { params }).pipe(
      tap(response => console.log('Fetched shifts:', response)),
      catchError(this.handleError)
    );
  }

  getShift(id: string): Observable<Shift> {
    console.log('Fetching shift with ID:', id);
    return this.http.get<Shift>(`${this.apiUrl}/${id}`).pipe(
      tap(shift => console.log('Fetched shift:', shift)),
      catchError(this.handleError)
    );
  }

  getWorkerShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/worker`)
      .pipe(catchError(this.handleError));
  }

  getAvailableShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/available`)
      .pipe(catchError(this.handleError));
  }

  getShiftHistory(page: number = 1): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/history`, { params: { page: page.toString() } })
      .pipe(catchError(this.handleError));
  }

  createShift(shiftData: Partial<Shift>): Observable<Shift> {
    console.log('Creating shift with data:', shiftData);
    return this.http.post<Shift>(this.apiUrl, { shift: shiftData }).pipe(
      tap(shift => console.log('Created shift:', shift)),
      catchError(error => {
        console.error('Error creating shift:', error);
        if (error.error?.errors) {
          return throwError(() => new Error(error.error.errors.join(', ')));
        }
        if (error.error?.error) {
          return throwError(() => new Error(error.error.error));
        }
        return throwError(() => new Error('Failed to create shift'));
      })
    );
  }

  updateShift(id: string, shiftData: Partial<Shift>): Observable<Shift> {
    console.log('Updating shift with ID:', id, 'Data:', shiftData);
    return this.http.put<Shift>(`${this.apiUrl}/${id}`, { shift: shiftData }).pipe(
      tap(shift => console.log('Updated shift:', shift)),
      catchError(this.handleError)
    );
  }

  deleteShift(id: string): Observable<void> {
    console.log('Deleting shift with ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('Deleted shift:', id)),
      catchError(this.handleError)
    );
  }

  // Shift actions
  applyForShift(id: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/${id}/apply`, {})
      .pipe(catchError(this.handleError));
  }

  startShift(id: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/${id}/start`, {})
      .pipe(catchError(this.handleError));
  }

  completeShift(id: string, rating?: number): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/${id}/complete`, { rating })
      .pipe(catchError(this.handleError));
  }

  cancelShift(id: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(catchError(this.handleError));
  }

  private formatDate(dateString: string | undefined): string {
    if (!dateString) {
      throw new Error('Date is required');
    }

    try {
      // Handle both ISO strings and date objects
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toISOString();
    } catch (error) {
      console.error('Error formatting date:', error);
      throw new Error('Invalid date format');
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.error) {
        errorMessage = Array.isArray(error.error.error) 
          ? error.error.error[0] 
          : error.error.error;
      } else if (error.status === 401) {
        errorMessage = 'Please log in to continue';
      } else if (error.status === 403) {
        errorMessage = 'You are not authorized to perform this action';
      } else if (error.status === 404) {
        errorMessage = 'Shift not found';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
} 