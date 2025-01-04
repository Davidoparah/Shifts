import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: number;
  shift_id: number;
  sender_id: number;
  recipient_id: number;
  sender_name: string;
  content: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMessages(shiftId: number, recipientId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/shifts/${shiftId}/chat_messages`,
      { params: { recipient_id: recipientId.toString() } }
    ).pipe(
      catchError(error => {
        console.error('Error fetching messages:', error);
        return throwError(() => error);
      })
    );
  }

  sendMessage(shiftId: number, recipientId: number, content: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.apiUrl}/shifts/${shiftId}/chat_messages`,
      {
        chat_message: { content },
        recipient_id: recipientId
      }
    ).pipe(
      catchError(error => {
        console.error('Error sending message:', error);
        return throwError(() => error);
      })
    );
  }

  // In a real application, you would also implement WebSocket connection here
  // for real-time messaging using ActionCable
  setupWebSocket() {
    // Implementation for WebSocket connection would go here
    // This would typically involve setting up an ActionCable consumer
    // and subscribing to the ChatChannel
  }
} 