import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Category } from '../models/api';
import { apiError } from '../services/api-error';
import { CatalogService } from '../services/catalog.service';
import { Feedback } from './feedback';

@Component({
  imports: [Feedback],
  template: `
    <header class="page-heading">
      <div><h1>Categorías</h1><p>Organiza los productos del catálogo.</p></div>
    </header>
    <st-feedback [error]="error()" [message]="message()" />
    <div class="split-grid">
      <section class="card" aria-labelledby="new-category">
        <h2 id="new-category">Agregar categoría</h2>
        <form (submit)="create($event)">
          <fieldset class="form-stack" [disabled]="busy()">
            <label>Nombre<input name="name" maxlength="120" required></label>
            <label>Descripción <span class="muted">(opcional)</span>
              <textarea name="description" maxlength="2000" rows="3"></textarea>
            </label>
            <button class="button primary" type="submit">{{ busy() ? 'Guardando…' : 'Guardar categoría' }}</button>
          </fieldset>
        </form>
      </section>
      <section class="card" aria-labelledby="category-list">
        <h2 id="category-list">Categorías disponibles</h2>
        @if (loading()) {
          <p role="status">Cargando categorías…</p>
        } @else if (loadFailed()) {
          <button class="button secondary" type="button" (click)="load()">Volver a cargar</button>
        } @else if (!categories().length) {
          <p class="muted">Todavía no hay categorías.</p>
        } @else {
          <ul class="item-list">
            @for (category of categories(); track category.id) {
              <li><strong>{{ category.name }}</strong>@if (category.description) { <p>{{ category.description }}</p> }</li>
            }
          </ul>
        }
      </section>
    </div>
  `,
})
export class CategoriesPage {
  private readonly api = inject(CatalogService);
  protected readonly categories = signal<Category[]>([]);
  protected readonly busy = signal(false);
  protected readonly loading = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');

  constructor() {
    void this.load();
  }

  protected async load() {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.error.set('');
    try {
      this.categories.set(await firstValueFrom(this.api.categories()));
    } catch (error) {
      this.loadFailed.set(true);
      this.error.set(apiError(error));
    } finally {
      this.loading.set(false);
    }
  }

  protected async create(event: Event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (this.busy() || !(form instanceof HTMLFormElement)) return;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();
    this.error.set('');
    this.message.set('');
    if (!name) {
      this.error.set('Ingresa un nombre para la categoría.');
      return;
    }

    this.busy.set(true);
    try {
      await firstValueFrom(this.api.createCategory({ name, description }));
      form.reset();
      this.message.set('Categoría creada.');
      await this.load();
    } catch (error) {
      this.error.set(apiError(error));
    } finally {
      this.busy.set(false);
    }
  }
}
