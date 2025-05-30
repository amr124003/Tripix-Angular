import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatServicesService {

  UserSendMsgUrl = 'https://localhost:7012/api/Account/Send-MSG';
  DriverSendMsgUrl = 'https://localhost:7012/api/Driver/Send-MSG';

  constructor(private http: HttpClient) { }

  UserSendMSG(Data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.UserSendMsgUrl, Data , {headers:headers});
  }

  DriverSendMSG(Data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.DriverSendMsgUrl,Data,{headers:headers});
  }
}
