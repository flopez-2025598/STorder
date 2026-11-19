import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { sections } from '../models/sections';
import { HealthService } from '../services/health.service';

@Component({
  imports: [AsyncPipe, RouterLink],
  template: `
    <header class="hero">
      <h1>Panel operativo</h1>
      <p>Sistema Distribuido de Gestión de Pedidos e Inventario</p>
    </header>

    <section aria-labelledby="modules-heading">
      <h2 id="modules-heading">Áreas de trabajo</h2>
      <div class="module-grid">
        @for (section of sections; track section.path) {
          <a class="module" [routerLink]="['/', section.path]">
            <h3>{{ section.title }}</h3>
            <p>{{ section.description }}</p>
          </a>
        }
      </div>
    </section>

    <section aria-labelledby="health-heading">
      <h2 id="health-heading">Estado de los servicios</h2>
      <dl class="service-list" aria-live="polite">
        @for (service of services; track service.name) {
          @let status = service.status | async;
          <div class="service-row">
            <dt>{{ service.name }}</dt>
            <dd [class.ready]="status === 'Disponible'">{{ status }}</dd>
          </div>
        }
      </dl>
    </section>
  `,
})
export class Dashboard {
  private readonly health = inject(HealthService);

  protected readonly sections = sections;
  protected readonly services = [
    { name: 'Autenticación', status: this.health.auth },
    { name: 'Catálogo', status: this.health.catalog },
  ];
}
