import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { WorkerProfile } from '../models/user.model';
import { BaseHttpService } from './base-http.service';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'business_owner' | 'worker';
  status: string;
  worker_profile?: WorkerProfile;
  business_profile?: any;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseHttpService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor(
    http: HttpClient,
    private router: Router
  ) {
    super(http, 'auth');
    this.loadStoredUser();
  }

  protected override handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }

  private loadStoredUser() {
    const token = localStorage.getItem(this.tokenKey);
    const storedUser = localStorage.getItem(this.userKey);
    
    console.log('Loading stored user - Token:', !!token, 'Stored user:', !!storedUser);
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('Parsed stored user:', user);
        this.currentUserSubject.next(user);
        // Validate token and update user data in background
        this.validateToken(token).subscribe({
          next: (valid) => console.log('Token validation result:', valid),
          error: (err) => console.error('Token validation error:', err)
        });
      } catch (e) {
        console.error('Error parsing stored user:', e);
        this.logout();
      }
    } else if (token) {
      // If we only have token, validate it to get user data
      this.validateToken(token).subscribe({
        next: (valid) => console.log('Token only validation result:', valid),
        error: (err) => console.error('Token only validation error:', err)
      });
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.post<AuthResponse>(this.endpoints['login'], { email, password })
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.post<AuthResponse>(this.endpoints['register'], userData)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(error => {
          console.error('Registration error:', error);
          if (error.status === 0) {
            return throwError(() => new Error('Unable to connect to the server. Please check if the server is running.'));
          }
          return throwError(() => error);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  private validateToken(token: string): Observable<boolean> {
    return this.get<User>(this.endpoints['me'])
      .pipe(
        map(user => {
          this.currentUserSubject.next(user);
          return true;
        }),
        catchError(() => {
          this.logout();
          return of(false);
        })
      );
  }

  private handleAuthentication(response: AuthResponse) {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    
    // If user is a worker, ensure they have a profile
    if (response.user.role === 'worker') {
      this.ensureWorkerProfile().subscribe({
        error: (error) => console.error('Error ensuring worker profile:', error)
      });
    }
  }

  forgotPassword(email: string): Observable<any> {
    return this.post(this.endpoints['forgotPassword'], { email })
      .pipe(catchError(this.handleError));
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.post(this.endpoints['resetPassword'], { token, password })
      .pipe(catchError(this.handleError));
  }

  ensureWorkerProfile(): Observable<any> {
    return this.post('/ensure-worker-profile', {})
      .pipe(catchError(this.handleError));
  }

  updateCurrentUser(user: User) {
    console.log('Updating current user:', user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
    console.log('Current user updated in storage and state');
  }
} 