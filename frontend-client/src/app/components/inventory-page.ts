import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { Product, Stock } from '../models/api';
import { apiError } from '../services/api-error';
import { CatalogService } from '../services/catalog.service';
import { Feedback } from './feedback';

@Component({
  imports: [Feedback, RouterLink],
  template: `
    <header class="page-heading">
      <div><h1>Inventario</h1><p>Consulta y ajusta las unidades disponibles de cada producto.</p></div>
    </header>
    <st-feedback [error]="error()" [message]="message()" />
    <section class="card inventory-card">
      @if (loading()) {
        <p role="status">Cargando productos…</p>
      } @else if (loadFailed()) {
        <button class="button secondary" type="button" (click)="load()">Volver a cargar productos</button>
      } @else if (!products().length) {
        <p>Agrega un producto para comenzar a registrar existencias.</p>
        <a class="button secondary" routerLink="/administracion/productos">Administrar productos</a>
      } @else {
        <div class="form-stack">
          <label for="inventory-product">Producto</label>
          <select id="inventory-product" #product [disabled]="busy()" (change)="select(product.value)">
            <option value="">Selecciona un producto</option>
            @for (item of products(); track item.id) {
              <option [value]="item.id">{{ item.name }} ({{ item.sku }})</option>
            }
          </select>
        </div>
        @if (busy() && !stock()) {
          <p role="status">Consultando existencias…</p>
        }
        @if (stock(); as current) {
          <form (submit)="update($event, current.productId)">
            <fieldset class="form-stack" [disabled]="busy()">
              <p>Unidades disponibles <strong>{{ current.stock }}</strong></p>
              <label>Nueva cantidad<input name="stock" type="number" min="0" max="2147483647" step="1" required [value]="current.stock"></label>
              <button class="button primary" type="submit">{{ busy() ? 'Guardando…' : 'Actualizar existencias' }}</button>
            </fieldset>
          </form>
        }
      }
    </section>
  `,
})
export class InventoryPage {
  private readonly api = inject(CatalogService);
  protected readonly products = signal<Product[]>([]);
  protected readonly stock = signal<Stock | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');

  constructor() {
    void this.load();
  }

  protected async load() {
    this.loading.set(true);
    this.error.set('');
    this.loadFailed.set(false);
    try {
      this.products.set(await firstValueFrom(this.api.products()));
    } catch (error) {
      this.loadFailed.set(true);
      this.error.set(apiError(error));
    } finally {
      this.loading.set(false);
    }
  }

  protected async select(id: string) {
    this.stock.set(null);
    this.error.set('');
    this.message.set('');
    if (!id) return;

    this.busy.set(true);
    try {
      this.stock.set(await firstValueFrom(this.api.stock(id)));
    } catch (error) {
      this.error.set(apiError(error));
    } finally {
      this.busy.set(false);
    }
  }

  protected async update(event: Event, id: string) {
    event.preventDefault();
    if (this.busy() || !(event.currentTarget instanceof HTMLFormElement)) return;
    const quantity = Number(new FormData(event.currentTarget).get('stock'));
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    try {
      this.stock.set(await firstValueFrom(this.api.updateStock(id, quantity)));
      this.message.set('Existencias actualizadas.');
    } catch (error) {
      this.error.set(apiError(error));
    } finally {
      this.busy.set(false);
    }
  }
}
