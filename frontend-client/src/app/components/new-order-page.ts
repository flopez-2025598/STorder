import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { Order, Product } from '../models/api';
import { QuetzalPipe } from '../pipes/quetzal.pipe';
import { apiError } from '../services/api-error';
import { CatalogService } from '../services/catalog.service';
import { UiIcon } from './ui-icon';
import { Feedback } from './feedback';

@Component({
  imports: [QuetzalPipe, Feedback, RouterLink, UiIcon],
  template: `
    <header class="page-heading">
      <div><h1>Nuevo pedido</h1><p>Selecciona los productos y revisa el resumen antes de enviar.</p></div>
      <a class="button secondary" routerLink="/pedidos">Ver pedidos</a>
    </header>

    <st-feedback [error]="error() || loadError()" />
    @if (created(); as order) {
      <div class="notice success confirmation" role="status">
        <div><strong>Pedido registrado.</strong> Total definitivo: {{ order.total | quetzal }}.</div>
        <a routerLink="/pedidos">Consultar pedido</a>
      </div>
    }

    @if (loading()) {
      <p class="notice" role="status">Cargando existencias…</p>
    } @else if (loadError()) {
      <button class="button secondary" type="button" (click)="load()">Volver a cargar</button>
    }

    @if (products().length) {
      <form class="order-layout" (submit)="submit($event)">
        <section class="card order-products" aria-labelledby="order-products">
          <h2 id="order-products">Productos</h2>
          <fieldset [disabled]="busy() || loading() || !!loadError()">
            @for (product of products(); track product.id) {
              <div class="order-product">
                <div class="table-product">
                  <span class="product-icon"><st-icon name="box" /></span>
                  <div><strong>{{ product.name }}</strong>
                  <p>{{ product.price | quetzal }} por unidad · {{ product.stock }} disponibles</p></div>
                </div>
                <label class="quantity">Cantidad
                  <input #quantity type="number" min="0" [max]="product.stock" step="1" required
                    [attr.aria-label]="'Cantidad de ' + product.name" [disabled]="product.stock === 0 && !getQuantity(product.id)"
                    [value]="getQuantity(product.id)" (input)="setQuantity(product.id, quantity.valueAsNumber)">
                </label>
              </div>
            }
          </fieldset>
        </section>
        <section class="card order-summary" aria-labelledby="order-summary">
          <h2 id="order-summary">Resumen del pedido</h2>
          @if (!selected().length) {
            <p class="muted">Indica una cantidad para agregar productos.</p>
          } @else {
            <ul class="item-list">
              @for (entry of selected(); track entry.product.id) {
                <li>
                  <strong>{{ entry.product.name }}</strong>
                  <span>{{ entry.quantity }} × {{ entry.product.price | quetzal }}</span>
                  @if (entry.quantity > entry.product.stock) {
                    <p class="inline-error">Reduce la cantidad. Quedan {{ entry.product.stock }} unidades.</p>
                  }
                </li>
              }
            </ul>
          }
          <div class="summary-total"><span>Total estimado</span><strong>{{ total() | quetzal }}</strong></div>
          @if (selected().length > 100) { <p class="inline-error">Selecciona hasta 100 productos por pedido.</p> }
          <button class="button primary" type="submit" [disabled]="!canSend()">
            <st-icon name="cart" />{{ busy() ? 'Enviando…' : 'Realizar pedido' }}
          </button>
        </section>
      </form>
    } @else if (!loading() && !loadError()) {
      <p class="empty">Todavía no hay productos en el catálogo.</p>
    }
  `,
})
export class NewOrderPage {
  private readonly api = inject(CatalogService);
  protected readonly products = signal<Product[]>([]);
  private readonly quantities = signal(new Map<string, number>());
  protected readonly loading = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly loadError = signal('');
  protected readonly created = signal<Order | null>(null);
  protected readonly selected = computed(() => this.products()
    .map((product) => ({ product, quantity: this.getQuantity(product.id) }))
    .filter(({ quantity }) => quantity > 0));
  protected readonly canSend = computed(() => {
    const selected = this.selected();
    return !this.busy() && !this.loading() && !this.loadError() && selected.length > 0 && selected.length <= 100
      && selected.every(({ product, quantity }) => Number.isInteger(quantity) && quantity <= product.stock);
  });
  protected readonly total = computed(() => {
    const cents = this.selected().reduce((sum, { product, quantity }) => {
      const [whole = '0', fraction = ''] = product.price.split('.');
      const price = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
      return sum + price * BigInt(Math.trunc(quantity));
    }, 0n);
    return (cents / 100n).toString() + '.' + (cents % 100n).toString().padStart(2, '0');
  });

  constructor() {
    void this.load();
  }

  protected getQuantity(id: string) {
    return this.quantities().get(id) ?? 0;
  }

  protected setQuantity(id: string, quantity: number) {
    this.quantities.update((current) =>
      new Map(current).set(id, Number.isFinite(quantity) && quantity > 0 ? quantity : 0));
    this.created.set(null);
  }

  protected async load() {
    this.loading.set(true);
    this.loadError.set('');
    try {
      const products = await firstValueFrom(this.api.products());
      this.products.set(products);
      this.quantities.update((current) => new Map(products
        .filter(({ id }) => current.has(id)).map(({ id }) => [id, current.get(id) ?? 0])));
    } catch (error) {
      this.loadError.set(apiError(error));
    } finally {
      this.loading.set(false);
    }
  }

  protected async submit(event: Event) {
    event.preventDefault();
    if (!this.canSend()) return;

    this.busy.set(true);
    this.error.set('');
    this.created.set(null);
    try {
      const items = this.selected().map(({ product, quantity }) => ({ productId: product.id, quantity }));
      this.created.set(await firstValueFrom(this.api.createOrder(items)));
      this.quantities.set(new Map());
    } catch (error) {
      this.error.set(apiError(error));
    } finally {
      await this.load();
      this.busy.set(false);
    }
  }
}
