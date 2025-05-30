import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'https://tripix.runasp.net/api/Chatbot/ask'; 

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(this.apiUrl,
      {message},
      {headers: new HttpHeaders({ 'Content-Type': 'application/json' })}
    );
  }
}
