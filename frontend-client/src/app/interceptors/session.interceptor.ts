import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Session } from '../services/session';

export const sessionInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(Session);
  const router = inject(Router);
  const token = session.token();
  const isProfile = request.url === environment.authApiUrl + '/auth/me';
  const isCatalog = request.url.startsWith(environment.catalogApiUrl + '/');
  if (!token || (!isProfile && !isCatalog)) return next(request);

  return next(request.clone({ setHeaders: { Authorization: 'Bearer ' + token } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && session.token() === token
          && (error.status === 401 || (isProfile && error.status === 404))) {
        session.end('Tu sesión ya no es válida. Vuelve a iniciar sesión.');
        if (!isProfile) void router.navigateByUrl('/ingresar');
      }
      return throwError(() => error);
    }),
  );
};
