import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiIcon } from './components/ui-icon';
import { Session } from './services/session';

@Component({
  selector: 'storder-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, UiIcon],
  template: `
    <a href="#contenido" class="skip-link" (click)="skipToContent($event, content)">Ir al contenido</a>
    <header class="topbar" [class.signed-in]="session.user()">
      <div class="shell topbar-content">
        <a class="brand" [routerLink]="session.user() ? '/' : '/ingresar'">
          <span class="brand-mark" aria-hidden="true"></span> STorder
        </a>
        @if (session.user(); as user) {
          <div class="session-controls">
            <div class="session-identity">
              <strong>{{ user.name ?? user.email }}</strong>
              <span>{{ user.role === 'admin' ? 'Administrador' : 'Operador' }}</span>
            </div>
            <button class="button secondary compact" type="button" (click)="logout()">Cerrar sesión</button>
          </div>
        }
      </div>
    </header>
    <div class="shell workspace" [class.signed-in]="session.user()">
      @if (session.user(); as user) {
        <nav class="navigation" aria-label="Navegación principal">
          <a class="brand sidebar-brand" routerLink="/">
            <span class="brand-mark" aria-hidden="true"></span> STorder
          </a>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
            ariaCurrentWhenActive="page"><st-icon name="home" />Panel</a>
          <a routerLink="/productos" routerLinkActive="active" ariaCurrentWhenActive="page"><st-icon name="box" />Productos</a>
          <a routerLink="/pedidos" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
            ariaCurrentWhenActive="page"><st-icon name="orders" />Pedidos</a>
          <a routerLink="/pedidos/nuevo" routerLinkActive="active" ariaCurrentWhenActive="page"><st-icon name="cart" />Nuevo pedido</a>
          @if (user.role === 'admin') {
            <span class="nav-label">Administración</span>
            <a routerLink="/administracion/productos" routerLinkActive="active" ariaCurrentWhenActive="page"><st-icon name="edit" />Gestionar productos</a>
            <a routerLink="/administracion/categorias" routerLinkActive="active" ariaCurrentWhenActive="page"><st-icon name="layers" />Categorías</a>
            <a routerLink="/administracion/inventario" routerLinkActive="active" ariaCurrentWhenActive="page"><st-icon name="stock" />Inventario</a>
          }
        </nav>
      }
      <main #content id="contenido" tabindex="-1" class="content">
        <router-outlet />
      </main>
    </div>
  `,
})
export class App {
  protected readonly session = inject(Session);
  private readonly router = inject(Router);

  protected skipToContent(event: Event, content: HTMLElement) {
    event.preventDefault();
    content.focus();
  }

  protected logout() {
    this.session.end();
    void this.router.navigateByUrl('/ingresar');
  }
}
