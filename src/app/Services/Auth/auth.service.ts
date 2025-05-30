import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  LoginUrl = "https://localhost:7012/api/Auth/Login";
  registerUrl = "https://localhost:7012/api/Auth/Register";
  googleLoginUrl = "https://localhost:7012/api/Auth/GoogleLogin";
  refreshtokenUrl = "https://localhost:7012/api/Auth/RefreshToken";
  confirmEmailUrl = "https://localhost:7012/api/Auth/Confirm-Email";
  ResendconfirmOTPUrl = "https://localhost:7012/api/Auth/Resend-ConfirmationOTP";
  ForgetPasswordUrl = "https://localhost:7012/api/Auth/Forget-Password";
  ResetPasswordUrl = "https://localhost:7012/api/Auth/Reset-Password";
  
  constructor(private http : HttpClient) { }

  Login(Credentials : any):Observable<any>
  {
    return this.http.post(this.LoginUrl,Credentials);
  }

  confirmEmail(Credentials : any):Observable<any>
  {
    return this.http.post(this.confirmEmailUrl,Credentials);
  }

  ResendconfirmOTP(Credentials : any):Observable<any>
  {
    return this.http.post(this.ResendconfirmOTPUrl,Credentials);
  }

  ForgetPassword(Credentials : any):Observable<any>
  {
    return this.http.post(this.ForgetPasswordUrl,Credentials);
  }

  ResetPassword(Credentials : any):Observable<any>
  {
    return this.http.post(this.ResetPasswordUrl,Credentials);
  }

  Register(Credentials : any):Observable<any>
  {
    return this.http.post(this.registerUrl,Credentials);
  }

  googleLogin(Credentials : any):Observable<any>
  {
   return this.http.post(this.googleLoginUrl,Credentials);
  }

  refreshToken(): Observable<any> {
    return this.http.get(this.refreshtokenUrl);
  }
}
