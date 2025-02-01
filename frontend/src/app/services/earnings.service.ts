import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EarningsSummary {
  totalEarnings: number;
  earningsChange: number;
  hoursWorked: number;
  averageRate: number;
  timeframe: 'week' | 'month' | 'year';
}

export interface ShiftEarning {
  id: string;
  title: string;
  date: Date;
  hours: number;
  rate: number;
  earnings: number;
  status: 'completed' | 'pending' | 'processing';
}

@Injectable({
  providedIn: 'root'
})
export class EarningsService {
  constructor(private http: HttpClient) {}

  getEarningsSummary(timeframe: 'week' | 'month' | 'year'): Observable<EarningsSummary> {
    return this.http.get<EarningsSummary>(`${environment.apiUrl}/worker/earnings/summary`, {
      params: { timeframe }
    });
  }

  getRecentShifts(limit: number = 10): Observable<ShiftEarning[]> {
    return this.http.get<ShiftEarning[]>(`${environment.apiUrl}/worker/earnings/shifts`, {
      params: { limit: limit.toString() }
    });
  }

  // Mock data for development
  getMockEarningsSummary(timeframe: 'week' | 'month' | 'year'): Observable<EarningsSummary> {
    const mockData: Record<string, EarningsSummary> = {
      week: {
        totalEarnings: 1250.75,
        earningsChange: 12.5,
        hoursWorked: 42,
        averageRate: 29.75,
        timeframe: 'week'
      },
      month: {
        totalEarnings: 5200.50,
        earningsChange: 8.2,
        hoursWorked: 168,
        averageRate: 31.00,
        timeframe: 'month'
      },
      year: {
        totalEarnings: 62400.00,
        earningsChange: 15.7,
        hoursWorked: 2016,
        averageRate: 30.50,
        timeframe: 'year'
      }
    };

    return of(mockData[timeframe]);
  }

  getMockRecentShifts(): Observable<ShiftEarning[]> {
    const mockShifts: ShiftEarning[] = [
      {
        id: '1',
        title: 'Security Guard - Downtown Mall',
        date: new Date('2024-01-10'),
        hours: 8,
        rate: 30,
        earnings: 240,
        status: 'completed'
      },
      {
        id: '2',
        title: 'Event Security - Concert',
        date: new Date('2024-01-08'),
        hours: 6,
        rate: 35,
        earnings: 210,
        status: 'completed'
      },
      {
        id: '3',
        title: 'Night Watch - Office Building',
        date: new Date('2024-01-05'),
        hours: 10,
        rate: 28,
        earnings: 280,
        status: 'completed'
      }
    ];

    return of(mockShifts);
  }
} 