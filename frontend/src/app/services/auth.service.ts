import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {
    let storedUser = null;
    try {
      const storedUserStr = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (storedUserStr) {
        storedUser = JSON.parse(storedUserStr);
        // Ensure token is attached to user object
        if (token) {
          storedUser.token = token;
        }
        if (refreshToken) {
          storedUser.refresh_token = refreshToken;
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private safeLocalStorageSet(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  }

  private safeLocalStorageRemove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          if (!response.user || !response.token || !response.refresh_token) {
            throw new Error('Invalid response format from server');
          }
          
          // Store tokens separately
          this.safeLocalStorageSet('token', response.token);
          this.safeLocalStorageSet('refresh_token', response.refresh_token);
          
          // Attach tokens to user object
          response.user.token = response.token;
          response.user.refresh_token = response.refresh_token;
          
          this.setCurrentUser(response.user);
        }),
        catchError(error => {
          console.error('Login error:', error);
          if (error.error?.code === 'account_inactive') {
            return throwError(() => new Error('Your account is not active. Please contact support.'));
          } else if (error.error?.code === 'invalid_credentials') {
            return throwError(() => new Error('Invalid email or password.'));
          } else if (error.status === 0) {
            return throwError(() => new Error('Network error. Please check your connection.'));
          }
          return throwError(() => new Error(error.error?.error || error.message || 'Login failed'));
        })
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh_token`, { refresh_token: refreshToken })
      .pipe(
        tap(response => {
          console.log('Refresh token response:', response);
          
          // Handle both response formats
          const token = response.token || response.auth?.token;
          const newRefreshToken = response.refresh_token || response.auth?.refresh_token;
          const user = response.user;
          
          if (!token) {
            console.error('Invalid token refresh response format:', response);
            throw new Error('Invalid token refresh response');
          }
          
          // Store tokens
          this.safeLocalStorageSet('token', token);
          if (newRefreshToken) {
            this.safeLocalStorageSet('refresh_token', newRefreshToken);
          }
          
          // Update current user
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            currentUser.token = token;
            if (newRefreshToken) {
              currentUser.refresh_token = newRefreshToken;
            }
            if (user) {
              // Update user properties if provided
              Object.assign(currentUser, user);
            }
            this.setCurrentUser(currentUser);
          }
        }),
        catchError(error => {
          console.error('Token refresh failed:', error);
          if (error.status === 401) {
            console.log('Refresh token expired or invalid, logging out');
            this.logout();
            return throwError(() => new Error('Session expired. Please log in again.'));
          }
          return throwError(() => new Error(error.error?.message || error.message || 'Token refresh failed'));
        })
      );
  }

  logout() {
    this.safeLocalStorageRemove('currentUser');
    this.safeLocalStorageRemove('token');
    this.safeLocalStorageRemove('refresh_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private setCurrentUser(user: User) {
    try {
      this.safeLocalStorageSet('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error setting current user:', error);
      this.currentUserSubject.next(user);
    }
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot_password`, { email })
      .pipe(
        catchError(error => {
          console.error('Forgot password error:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to process forgot password request'));
        })
      );
  }

  register(userData: Partial<User>): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (!response.user || !response.token || !response.refresh_token) {
            throw new Error('Invalid registration response');
          }
          this.setCurrentUser(response.user);
          localStorage.setItem('token', response.token);
          localStorage.setItem('refresh_token', response.refresh_token);
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed'));
        })
      );
  }
} 