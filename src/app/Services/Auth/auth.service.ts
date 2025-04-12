import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  LoginUrl = "https://tripix.runasp.net/api/Auth/Login";
  registerUrl = "https://tripix.runasp.net/api/Auth/Register";
  googleLoginUrl = "https://tripix.runasp.net/api/Auth/GoogleLogin";
  refreshtokenUrl = "https://tripix.runasp.net/api/Auth/Refrechtoken"

  

  constructor(private http : HttpClient) { }

  Login(Credentials : any):Observable<any>
  {
    return this.http.post(this.LoginUrl,Credentials);
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
