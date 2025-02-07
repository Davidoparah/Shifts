 import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../core/services/base-http.service';
import { PaginatedResponse } from '../models/common.model';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand?: string;
  last4: string;
  exp_month?: number;
  exp_year?: number;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'payout' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  payment_method?: PaymentMethod;
  metadata?: {
    shift_id?: string;
    worker_id?: string;
    business_id?: string;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
  };
  created_at: string;
}

export interface PayoutAccount {
  id: string;
  type: 'bank_account' | 'card';
  country: string;
  currency: string;
  account_holder_name: string;
  account_holder_type: 'individual' | 'company';
  routing_number?: string;
  account_number_last4: string;
  is_default: boolean;
  verification_status: 'pending' | 'verified' | 'failed';
  created_at: string;
}

export interface Balance {
  available: number;
  pending: number;
  currency: string;
  last_updated: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, 'payment');
  }

  // Payment Methods
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.get<PaymentMethod[]>(this.endpoints['methods']);
  }

  addPaymentMethod(data: {
    token: string;
    set_default?: boolean;
  }): Observable<PaymentMethod> {
    return this.post<PaymentMethod>(this.endpoints['methods'], data);
  }

  updatePaymentMethod(id: string, data: {
    name?: string;
    exp_month?: number;
    exp_year?: number;
    set_default?: boolean;
  }): Observable<PaymentMethod> {
    return this.put<PaymentMethod>(this.buildUrl(this.endpoints['method'], { id }), data);
  }

  deletePaymentMethod(id: string): Observable<void> {
    return this.delete<void>(this.buildUrl(this.endpoints['method'], { id }));
  }

  // Transactions
  getTransactions(params: {
    page?: number;
    per_page?: number;
    type?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<PaginatedResponse<Transaction>> {
    return this.get<PaginatedResponse<Transaction>>(this.endpoints['transactions'], params);
  }

  getTransaction(id: string): Observable<Transaction> {
    return this.get<Transaction>(this.buildUrl(this.endpoints['transaction'], { id }));
  }

  // Payout Accounts
  getPayoutAccounts(): Observable<PayoutAccount[]> {
    return this.get<PayoutAccount[]>(this.endpoints['payoutAccounts']);
  }

  addPayoutAccount(data: {
    country: string;
    currency: string;
    account_holder_name: string;
    account_holder_type: 'individual' | 'company';
    routing_number: string;
    account_number: string;
    set_default?: boolean;
  }): Observable<PayoutAccount> {
    return this.post<PayoutAccount>(this.endpoints['payoutAccounts'], data);
  }

  deletePayoutAccount(id: string): Observable<void> {
    return this.delete<void>(this.buildUrl(this.endpoints['payoutAccount'], { id }));
  }

  // Balance & Withdrawals
  getBalance(): Observable<Balance> {
    return this.get<Balance>(this.endpoints['balance']);
  }

  requestPayout(data: {
    amount: number;
    payout_account_id?: string;
  }): Observable<Transaction> {
    return this.post<Transaction>(this.endpoints['withdraw'], data);
  }

  // Earnings
  getEarnings(params: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Observable<{
    total: number;
    available: number;
    pending: number;
    breakdown: Array<{
      period: string;
      amount: number;
      transactions_count: number;
    }>;
  }> {
    return this.get(this.endpoints['earnings'], params);
  }
}