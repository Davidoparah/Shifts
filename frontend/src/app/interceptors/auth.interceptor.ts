import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/user.model';

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  
  // Add auth header with jwt if user is logged in
  const currentUser = authService.getCurrentUser();
  console.log('[Auth Interceptor] Current user:', currentUser?.email, 'Role:', currentUser?.role);
  
  // Get token from localStorage as backup
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refresh_token');
  console.log('[Auth Interceptor] Tokens available:', {
    hasAccessToken: !!token,
    hasRefreshToken: !!refreshToken,
    tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
    url: request.url
  });
  
  if (token) {
    console.log('[Auth Interceptor] Adding token to request:', request.url);
    request = request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  } else {
    console.warn('[Auth Interceptor] No token available for request:', request.url);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('[Auth Interceptor] 401 error details:', {
          url: request.url,
          isRefreshAttempt: request.url.includes('/auth/refresh_token'),
          errorMessage: error.error?.message || error.message,
          errorCode: error.error?.code
        });
        
        if (!request.url.includes('/auth/refresh_token')) {
          console.log('[Auth Interceptor] Attempting token refresh');
          const refreshToken = localStorage.getItem('refresh_token');
          
          if (refreshToken) {
            return authService.refreshToken().pipe(
              switchMap((response: AuthResponse) => {
                console.log('[Auth Interceptor] Token refreshed successfully');
                // Clone the original request with the new token
                const newRequest = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${response.token}`
                  }
                });
                // Retry the original request with the new token
                return next(newRequest);
              }),
              catchError((refreshError) => {
                console.error('[Auth Interceptor] Token refresh failed:', {
                  error: refreshError.error?.message || refreshError.message,
                  code: refreshError.error?.code
                });
                // If refresh fails, logout user and redirect to login
                authService.logout();
                return throwError(() => refreshError);
              })
            );
          } else {
            console.error('[Auth Interceptor] No refresh token available');
            authService.logout();
            return throwError(() => error);
          }
        }
      }
      return throwError(() => error);
    })
  );
}; 