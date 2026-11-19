import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Credentials, User } from '../models/api';
import { Session } from './session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(Session);
  private readonly base = environment.authApiUrl + '/auth';

  register(data: Credentials & { name: string }) {
    return this.http.post<{ user: User }>(this.base + '/register', data).pipe(map(({ user }) => user));
  }

  login(data: Credentials) {
    return this.http.post<{ token: string; user: User }>(this.base + '/login', data).pipe(
      tap(({ token, user }) => this.session.start(token, user)),
      map(({ user }) => user),
    );
  }

  me() {
    const token = this.session.token();
    return this.http.get<{ user: User }>(this.base + '/me').pipe(
      map(({ user }) => {
        if (token) this.session.updateUser(token, user);
        return this.session.token() === token ? user : null;
      }),
    );
  }
}
