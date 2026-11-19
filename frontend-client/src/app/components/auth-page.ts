import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiError } from '../services/api-error';
import { AuthService } from '../services/auth.service';
import { Session } from '../services/session';
import { Feedback } from './feedback';

@Component({
  imports: [Feedback, RouterLink],
  template: `
    <div class="auth-layout">
      <div class="auth-intro">
        <div class="auth-logo" role="img" aria-label="Logo de STorder"></div>
        <h1>{{ registering ? 'Crea tu cuenta' : 'Ingresa a STorder' }}</h1>
        <p>{{ registering ? 'Regístrate para consultar productos y hacer pedidos.' : 'Consulta el catálogo, gestiona existencias y sigue tus pedidos.' }}</p>
      </div>
      <div class="card auth-card">
        <h2>{{ registering ? 'Registro' : 'Inicio de sesión' }}</h2>
        <st-feedback [error]="error() || session.notice() || verificationError" [message]="registrationMessage" />
        <form (submit)="submit($event)" class="form-stack">
          <fieldset [disabled]="busy()">
            @if (registering) {
              <label>Nombre<input name="name" autocomplete="name" maxlength="100" required></label>
            }
            <label>Correo electrónico<input type="email" name="email" autocomplete="email" maxlength="254" required></label>
            <label>Contraseña<input type="password" name="password" [attr.minlength]="registering ? 8 : 1"
              [attr.autocomplete]="registering ? 'new-password' : 'current-password'" required></label>
            <button class="button primary" type="submit">
              {{ busy() ? 'Procesando…' : registering ? 'Crear cuenta' : 'Iniciar sesión' }}
            </button>
          </fieldset>
        </form>
        @if (registering) {
          <p class="muted">¿Ya tienes cuenta? <a routerLink="/ingresar">Inicia sesión</a></p>
        } @else {
          <p class="muted">¿Aún no tienes cuenta? <a routerLink="/registrar">Regístrate</a></p>
        }
      </div>
    </div>
  `,
})
export class AuthPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly session = inject(Session);
  protected readonly registering = this.route.snapshot.data['registering'] === true;
  protected readonly registrationMessage = this.route.snapshot.queryParamMap.has('registro')
    ? 'Cuenta creada. Inicia sesión para continuar.' : '';
  protected readonly verificationError = this.route.snapshot.queryParamMap.has('sesion')
    ? 'No se pudo verificar la sesión. Intenta iniciar sesión de nuevo.' : '';
  protected readonly error = signal('');
  protected readonly busy = signal(false);

  protected async submit(event: Event) {
    event.preventDefault();
    if (this.busy() || !(event.currentTarget instanceof HTMLFormElement)) return;

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const password = String(data.get('password') ?? '');
    const name = String(data.get('name') ?? '').trim();
    this.error.set('');

    if (this.registering && !name) {
      this.error.set('Ingresa un nombre.');
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      this.error.set('La contraseña supera el límite de 72 bytes.');
      return;
    }

    this.busy.set(true);
    try {
      if (this.registering) {
        await firstValueFrom(this.auth.register({ name, email, password }));
        await this.router.navigate(['/ingresar'], { queryParams: { registro: 'creado' } });
      } else {
        await firstValueFrom(this.auth.login({ email, password }));
        await this.router.navigateByUrl('/productos');
      }
    } catch (error) {
      this.error.set(apiError(error));
    } finally {
      this.busy.set(false);
    }
  }
}
