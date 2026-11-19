import { Injectable, signal } from '@angular/core';
import type { User } from '../models/api';

const storageKey = 'storder.session';

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly jwt = signal(sessionStorage.getItem(storageKey));
  private readonly identity = signal<User | null>(null);
  private readonly status = signal('');

  readonly token = this.jwt.asReadonly();
  readonly user = this.identity.asReadonly();
  readonly notice = this.status.asReadonly();

  start(token: string, user: User): void {
    sessionStorage.setItem(storageKey, token);
    this.status.set('');
    this.jwt.set(token);
    this.identity.set(user);
  }

  updateUser(token: string, user: User): void {
    if (this.token() === token) this.identity.set(user);
  }

  end(notice = ''): void {
    sessionStorage.removeItem(storageKey);
    this.jwt.set(null);
    this.identity.set(null);
    this.status.set(notice);
  }
}
