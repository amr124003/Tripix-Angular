import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { AuthService } from "../../../Services/Auth/auth.service";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn : 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe(
      catchError(err => {
        if (err.status === 401) {
          return this.authService.refreshToken().pipe(
            switchMap((newTokens: any) => {
              sessionStorage.setItem("token", newTokens.token);
              authReq = req.clone({ setHeaders: { Authorization: `Bearer ${newTokens.accessToken}` } });
              return next.handle(authReq);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}