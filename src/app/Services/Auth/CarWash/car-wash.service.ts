import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarWashService {

  BookturnUrl = 'https://localhost:7012/api/CarWash/BookWashTurn';
  token = sessionStorage.getItem('token') || localStorage.getItem('token') || "";

  constructor(private http: HttpClient) { }

  BookTurn(Data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(this.BookturnUrl, Data, { headers });
  }

}
