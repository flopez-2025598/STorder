import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { Order } from '../models/api';
import { QuetzalPipe } from '../pipes/quetzal.pipe';
import { apiError } from '../services/api-error';
import { CatalogService } from '../services/catalog.service';
import { Session } from '../services/session';
import { Feedback } from './feedback';

@Component({
  imports: [QuetzalPipe, DatePipe, Feedback, RouterLink],
  template: `
    <header class="page-heading">
      <div>
        <h1>{{ session.user()?.role === 'admin' ? 'Pedidos' : 'Mis pedidos' }}</h1>
        <p>Consulta el estado, las cantidades y el total de cada pedido.</p>
      </div>
      <a class="button primary" routerLink="/pedidos/nuevo">Nuevo pedido</a>
    </header>
    <st-feedback [error]="error()" />
    @if (loading()) {
      <p class="notice" role="status">Cargando pedidos…</p>
    } @else if (error()) {
      <button class="button secondary" type="button" (click)="load()">Volver a cargar</button>
    } @else if (!orders().length) {
      <p class="empty">Todavía no hay pedidos para mostrar.</p>
    } @else {
      <div class="orders-list">
        @for (order of orders(); track order.id) {
          <article class="card">
            <header class="order-heading">
              <div>
                <h2>Pedido {{ order.id.slice(0, 8).toUpperCase() }}</h2>
                <time [attr.datetime]="order.createdAt">{{ order.createdAt | date:'dd/MM/yyyy, HH:mm' }}</time>
              </div>
              <span class="pill" [attr.data-order-status]="order.status">{{ statusLabels[order.status] }}</span>
            </header>
            <ul class="item-list">
              @for (item of order.items; track item.productId) {
                <li>
                  <strong>{{ names().get(item.productId) ?? 'Producto ' + item.productId }}</strong>
                  <span>{{ item.quantity }} × {{ item.unitPrice | quetzal }}</span>
                </li>
              }
            </ul>
            <div class="summary-total"><span>Total</span><strong>{{ order.total | quetzal }}</strong></div>
          </article>
        }
      </div>
    }
  `,
})
export class OrdersPage {
  private readonly api = inject(CatalogService);
  protected readonly session = inject(Session);
  protected readonly orders = signal<Order[]>([]);
  protected readonly names = signal(new Map<string, string>());
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly statusLabels: Record<Order['status'], string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  constructor() {
    void this.load();
  }

  protected async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      const [orders, products] = await Promise.all([
        firstValueFrom(this.api.orders()),
        firstValueFrom(this.api.products()).catch(() => []),
      ]);
      this.orders.set(orders);
      this.names.set(new Map(products.map(({ id, name }) => [id, name])));
    } catch (error) {
      this.error.set(apiError(error));
    } finally {
      this.loading.set(false);
    }
  }
}
