// // libs/auth/src/lib/interceptors/auth.interceptor.ts
// import { inject, Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
// import { Observable, from, switchMap } from 'rxjs';
// import { AuthService } from '../auth-service/auth.service';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   private authService = inject(AuthService);

//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     return from(this.authService.getAuthorizationHeaders()).pipe(
//       switchMap(headers => {
//         const authReq = request.clone({
//           setHeaders: headers
//         });
//         return next.handle(authReq);
//       })
//     );
//   }
// }

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth-service/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  return from(authService.getAuthorizationHeaders()).pipe(
    switchMap(headers => {
      const authReq = req.clone({ setHeaders: headers });
      return next(authReq);
    })
  );
};