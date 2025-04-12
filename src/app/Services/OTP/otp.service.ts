import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  OtpEndpointUrl = 'https://tripix.runasp.net/api/OTP/send-otp'
  constructor(private http : HttpClient) { }

  SendOTP(email : string):Observable<any>
  {
    return this.http.post(this.OtpEndpointUrl,{email});
  }
}
