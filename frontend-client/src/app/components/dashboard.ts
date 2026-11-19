import { AsyncPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { CatalogService } from '../services/catalog.service';
import { UiIcon } from './ui-icon';
import { sections } from '../models/sections';
import { HealthService } from '../services/health.service';
import { Session } from '../services/session';

@Component({
  imports: [AsyncPipe, RouterLink, UiIcon],
  template: `
    <header class="hero">
      <h1>{{ isAdmin() ? 'Panel de administración' : 'Panel operativo' }}</h1>
      <p>{{ isAdmin() ? 'Gestiona el catálogo, las existencias y los pedidos.' : 'Explora el catálogo y consulta tus pedidos.' }}</p>
    </header>

    <dl class="dashboard-stats" aria-label="Indicadores del panel">
      @let totals = productTotals | async;
      @for (stat of [
        { label: 'Productos', icon: 'box', value: totals?.products },
        { label: 'Categorías', icon: 'layers', value: categoryCount | async },
        { label: isAdmin() ? 'Pedidos' : 'Mis pedidos', icon: 'cart', value: orderCount | async },
        { label: 'Unidades', icon: 'stock', value: totals?.units }
      ]; track stat.icon) {
        <div class="stat-card">
          <span class="stat-icon" [class.cyan]="stat.icon === 'stock'">
            @switch (stat.icon) {
              @case ('box') { <st-icon name="box" /> }
              @case ('layers') { <st-icon name="layers" /> }
              @case ('cart') { <st-icon name="cart" /> }
              @case ('stock') { <st-icon name="stock" /> }
            }
          </span>
          <div><dt>{{ stat.label }}</dt><dd>{{ stat.value ?? '—' }}</dd></div>
        </div>
      }
    </dl>

    <section aria-labelledby="modules-heading">
      <h2 id="modules-heading">Accesos rápidos</h2>
      <div class="module-grid">
        @for (section of sections; track section.path) {
          <a class="module" [routerLink]="['/', section.path]">
            <st-icon [name]="section.icon" />
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

  private readonly catalog = inject(CatalogService);
  protected readonly productTotals = this.catalog.products().pipe(
    map((products) => ({ products: products.length, units: products.reduce((sum, product) => sum + product.stock, 0) })),
    catchError(() => of(null)),
  );
  protected readonly categoryCount = this.catalog.categories().pipe(map((categories) => categories.length), catchError(() => of(null)));
  protected readonly orderCount = this.catalog.orders().pipe(map((orders) => orders.length), catchError(() => of(null)));

  private readonly session = inject(Session);

  protected readonly isAdmin = computed(() => this.session.user()?.role === 'admin');
  protected readonly sections = sections;
  protected readonly services = [
    { name: 'Autenticación', status: this.health.auth },
    { name: 'Catálogo', status: this.health.catalog },
  ];
}
