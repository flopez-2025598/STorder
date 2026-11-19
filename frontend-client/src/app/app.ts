import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { sections } from './models/sections';

@Component({
  selector: 'storder-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="topbar">
      <div class="shell topbar-content">
        <a class="brand" routerLink="/">
          <span class="brand-mark" aria-hidden="true">ST</span> STorder
        </a>
        <nav aria-label="Navegación principal">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
            ariaCurrentWhenActive="page">Panel</a>
          @for (section of sections; track section.path) {
            <a [routerLink]="['/', section.path]" routerLinkActive="active"
              ariaCurrentWhenActive="page">{{ section.title }}</a>
          }
        </nav>
      </div>
    </header>
    <main class="shell content">
      <router-outlet />
    </main>
  `,
})
export class App {
  protected readonly sections = sections;
}
