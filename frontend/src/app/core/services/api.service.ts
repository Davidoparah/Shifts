import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private formatErrors(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.error?.error || error.message;
    }

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      code: error.error?.code
    }));
  }

  get<T>(path: string, params: any = {}): Observable<T> {
    const httpParams = this.toHttpParams(params);
    return this.http.get<T>(`${environment.apiUrl}${path}`, { params: httpParams })
      .pipe(catchError(this.formatErrors));
  }

  post<T>(path: string, body: any = {}): Observable<T> {
    return this.http.post<T>(`${environment.apiUrl}${path}`, body)
      .pipe(catchError(this.formatErrors));
  }

  put<T>(path: string, body: any = {}): Observable<T> {
    return this.http.put<T>(`${environment.apiUrl}${path}`, body)
      .pipe(catchError(this.formatErrors));
  }

  patch<T>(path: string, body: any = {}): Observable<T> {
    return this.http.patch<T>(`${environment.apiUrl}${path}`, body)
      .pipe(catchError(this.formatErrors));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${environment.apiUrl}${path}`)
      .pipe(catchError(this.formatErrors));
  }

  private toHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    
    return httpParams;
  }
} 