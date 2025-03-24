import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentServiceService {

  private addcardurl = 'https://localhost:7012/api/Payment/add-card'; // ضع رابط الـ API الفعلي هنا
  private getCardsurl = 'https://localhost:7012/api/Payment/get-cards'; // ضع رابط الـ API الفعلي هنا

  constructor(private http: HttpClient) {}

  saveCard(cardData: any): Observable<any> {
    return this.http.post(this.addcardurl, cardData);
  }

  getCards():Observable<any> {
    return this.http.get(this.getCardsurl);
  }
}
