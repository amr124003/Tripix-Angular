import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../Services/Auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const http = inject(HttpClient);

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true // ⬅️ مهم علشان يبعت الـ cookies
    });
  } else {
    authReq = req.clone({
      withCredentials: true // ⬅️ مهم برضو حتى من غير توكن
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // ⬅️ استدعاء API لتجديد التوكن مع withCredentials لتبعت الكوكيز
        return http.post<any>(
          'https://localhost:7012/api/Auth/RefreshToken',
          {},
          { withCredentials: true }
        ).pipe(
          switchMap((res) => {
            const newToken = res.token;

            localStorage.setItem('token', newToken);

            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              },
              withCredentials: true
            });

            return next(clonedRequest);
          }),
          catchError(err => {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            return throwError(() => err);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
