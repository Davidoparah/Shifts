 import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../core/services/base-http.service';
import { PaginatedResponse } from '../models/common.model';

export interface Notification {
  id: string;
  type: 'shift' | 'payment' | 'system' | 'chat';
  title: string;
  message: string;
  read: boolean;
  data?: {
    shift_id?: string;
    payment_id?: string;
    chat_id?: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface NotificationPreferences {
  email: {
    shift_updates: boolean;
    payment_updates: boolean;
    chat_messages: boolean;
    marketing: boolean;
  };
  push: {
    shift_updates: boolean;
    payment_updates: boolean;
    chat_messages: boolean;
    marketing: boolean;
  };
  sms: {
    shift_updates: boolean;
    payment_updates: boolean;
    chat_messages: boolean;
    marketing: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, 'notification');
  }

  // Notification Management
  getNotifications(params: {
    page?: number;
    per_page?: number;
    type?: string;
    read?: boolean;
  }): Observable<PaginatedResponse<Notification>> {
    return this.get<PaginatedResponse<Notification>>(this.endpoints['list'], params);
  }

  markAsRead(id: string): Observable<Notification> {
    return this.post<Notification>(this.buildUrl(this.endpoints['markRead'], { id }), {});
  }

  markAllAsRead(): Observable<void> {
    return this.post<void>(this.endpoints['markAllRead'], {});
  }

  deleteNotification(id: string): Observable<void> {
    return this.delete<void>(this.buildUrl(this.endpoints['delete'], { id }));
  }

  // Preferences Management
  getPreferences(): Observable<NotificationPreferences> {
    return this.get<NotificationPreferences>(this.endpoints['preferences']);
  }

  updatePreferences(preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.put<NotificationPreferences>(this.endpoints['preferences'], preferences);
  }

  // Device Token Management
  registerDeviceToken(data: {
    token: string;
    platform: 'ios' | 'android' | 'web';
    device_id: string;
  }): Observable<void> {
    return this.post<void>(this.endpoints['registerDevice'], data);
  }

  unregisterDeviceToken(device_id: string): Observable<void> {
    return this.delete<void>(this.buildUrl(this.endpoints['unregisterDevice'], { device_id }));
  }
}