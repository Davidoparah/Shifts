import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { microservicesConfig } from '../config/microservices.config';

export type ServiceName = keyof typeof microservicesConfig;

type MicroserviceConfig = {
  baseUrl: string;
  endpoints?: Record<string, string>;
  timeout?: number;
};

@Injectable({
  providedIn: 'root'
})
export class BaseHttpService {
  protected baseUrl: string;
  protected endpoints: Record<string, string>;
  protected defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(
    protected http: HttpClient,
    @Inject('SERVICE_NAME') serviceName: ServiceName
  ) {
    const config = microservicesConfig[serviceName] as MicroserviceConfig;
    this.baseUrl = config.baseUrl;
    this.endpoints = config.endpoints || {};
  }

  protected get<T>(endpoint: string, params?: any): Observable<T> {
    const options = { 
      headers: this.defaultHeaders,
      params: this.buildParams(params)
    };
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  protected post<T>(endpoint: string, body: any, params?: any): Observable<T> {
    const options = {
      headers: this.defaultHeaders,
      params: this.buildParams(params)
    };
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  protected put<T>(endpoint: string, body: any, params?: any): Observable<T> {
    const options = {
      headers: this.defaultHeaders,
      params: this.buildParams(params)
    };
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  protected patch<T>(endpoint: string, body: any, params?: any): Observable<T> {
    const options = {
      headers: this.defaultHeaders,
      params: this.buildParams(params)
    };
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  protected delete<T>(endpoint: string, params?: any): Observable<T> {
    const options = {
      headers: this.defaultHeaders,
      params: this.buildParams(params)
    };
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  protected buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }

  protected handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }

  protected buildUrl(endpoint: string, params: { [key: string]: string } = {}): string {
    let url = endpoint;
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    return url;
  }
} 