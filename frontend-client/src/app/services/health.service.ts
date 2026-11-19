import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of, startWith } from 'rxjs';
import { environment } from '../../environments/environment';
import type { ServiceHealth } from '../models/service-health';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);

  private check(apiUrl: string) {
    return this.http.get<ServiceHealth>(`${apiUrl}/health`, { timeout: 4000 }).pipe(
      map((health) => health.status === 'ok' && health.database === 'up' ? 'Disponible' : 'No disponible'),
      catchError(() => of('No disponible')),
      startWith('Verificando'),
    );
  }

  readonly auth = this.check(environment.authApiUrl);
  readonly catalog = this.check(environment.catalogApiUrl);
}
