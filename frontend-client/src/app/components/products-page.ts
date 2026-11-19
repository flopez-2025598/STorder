import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { Category, Product, ProductFilters, ProductInput } from '../models/api';
import { QuetzalPipe } from '../pipes/quetzal.pipe';
import { apiError } from '../services/api-error';
import { CatalogService } from '../services/catalog.service';
import { Feedback } from './feedback';
import { UiIcon } from './ui-icon';
import { ProductForm } from './product-form';

@Component({
  imports: [QuetzalPipe, Feedback, ProductForm, RouterLink, UiIcon],
  template: `
    <header class="page-heading">
      <div>
        <h1>{{ admin ? 'Administrar productos' : 'Catálogo de productos' }}</h1>
        <p>{{ admin ? 'Agrega, edita o elimina productos del catálogo.' : 'Busca productos y consulta las unidades disponibles.' }}</p>
      </div>
      @if (admin) {
        <button class="button primary" type="button" [disabled]="busy() || !categories().length"
          (click)="openEditor(null)"><st-icon name="plus" />Agregar producto</button>
      } @else {
        <a class="button primary" routerLink="/pedidos/nuevo"><st-icon name="cart" />Nuevo pedido</a>
      }
    </header>

    <st-feedback [error]="error() || denied()" [message]="message()" />
    @if (admin && !categoriesBusy() && !categories().length) {
      <p class="notice">Para agregar productos, primero crea una categoría.
        <a routerLink="/administracion/categorias">Ir a categorías</a>
      </p>
    }

    @for (entry of editorEntries(); track entry?.id ?? 'new') {
      <section class="card editor" aria-labelledby="product-editor">
        <h2 id="product-editor">{{ entry ? 'Editar producto' : 'Agregar producto' }}</h2>
        <st-product-form [product]="entry" [categories]="categories()" [busy]="busy()"
          (saved)="save($event, entry)" (cancelled)="editor.set(undefined)" />
      </section>
    }

    @if (toDelete(); as product) {
      <section class="card editor" aria-labelledby="delete-title">
        <h2 id="delete-title">Eliminar {{ product.name }}</h2>
        <p>Confirma la eliminación de este producto del catálogo.</p>
        <div class="actions">
          <button class="button danger" type="button" [disabled]="busy()" (click)="remove(product)">
            {{ busy() ? 'Eliminando…' : 'Confirmar eliminación' }}
          </button>
          <button class="button secondary" type="button" [disabled]="busy()" (click)="toDelete.set(null)">Conservar producto</button>
        </div>
      </section>
    }

    <form class="card filters" (submit)="search($event)">
      <label>Nombre<span class="search-field"><st-icon name="search" />
        <input name="name" type="search" maxlength="120" placeholder="Buscar por nombre"></span></label>
      <label>Categoría
        <select name="categoryId">
          <option value="">Todas las categorías</option>
          @for (category of categories(); track category.id) {
            <option [value]="category.id">{{ category.name }}</option>
          }
        </select>
      </label>
      <button class="button secondary" type="submit" [disabled]="loading() || busy()">Buscar</button>
    </form>

    @if (loading() || categoriesBusy()) {
      <p class="notice" role="status">Cargando catálogo…</p>
    } @else if (loadFailed()) {
      <button class="button secondary" type="button" (click)="initialize()">Volver a cargar catálogo</button>
    } @else if (!products().length) {
      <p class="empty">{{ filtered() ? 'La búsqueda no encontró productos.' : 'Todavía no hay productos en el catálogo.' }}</p>
    } @else if (admin) {
      <div class="product-table" role="region" aria-label="Productos del catálogo" tabindex="0">
        <table>
          <thead><tr>
            <th scope="col">Producto</th><th scope="col">Categoría</th><th scope="col">Precio</th>
            <th scope="col">Existencias</th><th scope="col">Acciones</th>
          </tr></thead>
          <tbody>
            @for (product of products(); track product.id) {
              <tr>
                <th scope="row">
                  <div class="table-product">
                    <span class="product-icon"><st-icon name="box" /></span>
                    <div><strong>{{ product.name }}</strong><p>{{ product.description }}</p></div>
                  </div>
                </th>
                <td>{{ categoryNames().get(product.categoryId) ?? 'Categoría sin nombre' }}</td>
                <td class="table-price">{{ product.price | quetzal }}</td>
                <td><span class="pill" [class.out-of-stock]="product.stock === 0">{{ product.stock }}</span></td>
                <td>
                  <div class="actions">
                    <button class="button secondary compact" type="button" [disabled]="busy()" (click)="openEditor(product)"
                      [attr.aria-label]="'Editar ' + product.name"><st-icon name="edit" /><span class="sr-only">Editar</span></button>
                    <button class="button text-danger compact" type="button" [disabled]="busy()"
                      (click)="editor.set(undefined); toDelete.set(product)" [attr.aria-label]="'Eliminar ' + product.name">
                      <st-icon name="trash" /><span class="sr-only">Eliminar</span></button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <div class="product-grid">
        @for (product of products(); track product.id) {
          <article class="card product">
            <div class="product-cover">
              <st-icon name="box" />
              <span class="pill" [class.out-of-stock]="product.stock === 0">
                {{ product.stock === 0 ? 'Agotado' : product.stock + ' disponibles' }}
              </span>
            </div>
            <div class="product-meta">{{ categoryNames().get(product.categoryId) ?? 'Categoría sin nombre' }}</div>
            <h2>{{ product.name }}</h2>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-bottom">
              <strong><span class="sr-only">Precio </span>{{ product.price | quetzal }}</strong>
            </div>
          </article>
        }
      </div>
    }
  `,
})
export class ProductsPage {
  private readonly api = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private filters: ProductFilters = {};

  protected readonly admin = this.route.snapshot.data['admin'] === true;
  private readonly query = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly denied = computed(() => this.query().has('permiso')
    ? 'No tienes permisos para acceder a esa página.' : '');
  protected readonly categories = signal<Category[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly categoryNames = computed(() => new Map(this.categories().map(({ id, name }) => [id, name])));
  protected readonly filtered = signal(false);
  protected readonly loading = signal(false);
  protected readonly categoriesBusy = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');
  protected readonly editor = signal<Product | null | undefined>(undefined);
  protected readonly editorEntries = computed(() => {
    const entry = this.editor();
    return entry === undefined ? [] : [entry];
  });
  protected readonly toDelete = signal<Product | null>(null);

  constructor() {
    void this.initialize();
  }

  protected async initialize() {
    this.error.set('');
    this.categoriesBusy.set(true);
    this.loading.set(true);
    this.loadFailed.set(false);
    try {
      const [categories, products] = await Promise.all([
        firstValueFrom(this.api.categories()),
        firstValueFrom(this.api.products(this.filters)),
      ]);
      this.categories.set(categories);
      this.products.set(products);
    } catch (error) {
      this.loadFailed.set(true);
      this.error.set(apiError(error));
    } finally {
      this.categoriesBusy.set(false);
      this.loading.set(false);
    }
  }

  protected async search(event: Event) {
    event.preventDefault();
    if (this.loading() || this.busy() || !(event.currentTarget instanceof HTMLFormElement)) return;
    const data = new FormData(event.currentTarget);
    this.filters = {
      name: String(data.get('name') ?? '').trim(),
      categoryId: String(data.get('categoryId') ?? ''),
    };
    this.filtered.set(Boolean(this.filters.name || this.filters.categoryId));
    this.error.set('');
    this.message.set('');
    if (this.loadFailed()) {
      await this.initialize();
      return;
    }
    await this.refresh();
  }

  protected openEditor(product: Product | null) {
    this.toDelete.set(null);
    this.error.set('');
    this.message.set('');
    this.editor.set(product);
  }

  protected async save(input: ProductInput, product: Product | null) {
    if (this.busy()) return;
    await this.mutate(async () => {
      await firstValueFrom(product ? this.api.updateProduct(product.id, input) : this.api.createProduct(input));
      this.editor.set(undefined);
      return product ? 'Producto actualizado.' : 'Producto agregado.';
    });
  }

  protected async remove(product: Product) {
    if (this.busy()) return;
    await this.mutate(async () => {
      await firstValueFrom(this.api.deleteProduct(product.id));
      this.toDelete.set(null);
      return 'Producto eliminado.';
    });
  }

  private async refresh() {
    this.loading.set(true);
    this.loadFailed.set(false);
    try {
      this.products.set(await firstValueFrom(this.api.products(this.filters)));
    } catch (error) {
      this.loadFailed.set(true);
      this.error.set(apiError(error));
    } finally {
      this.loading.set(false);
    }
  }

  private async mutate(operation: () => Promise<string>) {
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    try {
      this.message.set(await operation());
      await this.refresh();
    } catch (error) {
      this.error.set(apiError(error));
    } finally {
      this.busy.set(false);
    }
  }
}
