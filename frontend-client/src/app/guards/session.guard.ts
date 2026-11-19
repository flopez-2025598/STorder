import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Session } from '../services/session';

export const sessionGuard: CanActivateFn = (route) => {
  const session = inject(Session);
  const router = inject(Router);
  const auth = inject(AuthService);
  if (!session.token()) return router.createUrlTree(['/ingresar']);

  return auth.me().pipe(
    map((user) => {
      if (!user) return router.createUrlTree(['/ingresar']);
      if (route.data['admin'] && user.role !== 'admin') {
        return router.createUrlTree(['/productos'], { queryParams: { permiso: 'denegado' } });
      }
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/ingresar'], {
      queryParams: session.token() ? { sesion: 'verificar' } : {},
    }))),
  );
};
