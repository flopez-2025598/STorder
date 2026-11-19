import { Component, input, output, signal } from '@angular/core';
import { QUETZAL_SYMBOL } from '../pipes/quetzal.pipe';
import type { Category, Product, ProductInput } from '../models/api';

@Component({
  selector: 'st-product-form',
  template: `
    <form (submit)="submit($event)">
      <fieldset class="form-grid" [disabled]="busy()">
        <label>Nombre<input name="name" [value]="product()?.name ?? ''" maxlength="120" required></label>
        <label>Categoría
          <select name="categoryId" required>
            <option value="">Selecciona una categoría</option>
            @for (category of categories(); track category.id) {
              <option [value]="category.id" [selected]="category.id === product()?.categoryId">{{ category.name }}</option>
            }
          </select>
        </label>
        <label class="full">Descripción<textarea name="description" rows="3" maxlength="2000"
          [value]="product()?.description ?? ''"></textarea></label>
        <label>Precio en quetzales
          <span class="currency-field">
            <span aria-hidden="true">{{ currencySymbol }}</span>
            <input inputmode="decimal" name="price" pattern="[0-9]{1,10}([.,][0-9]{1,2})?"
              [value]="product()?.price ?? ''" required>
          </span>
        </label>
        <label>Unidades disponibles<input name="stock" type="number" min="0" max="2147483647" step="1"
          [value]="product()?.stock ?? 0" required></label>
        @if (invalidName()) { <p class="full notice error" role="alert">Ingresa un nombre.</p> }
        <div class="actions full">
          <button class="button primary" type="submit">{{ busy() ? 'Guardando…' : 'Guardar producto' }}</button>
          <button class="button secondary" type="button" (click)="cancelled.emit()">Cerrar</button>
        </div>
      </fieldset>
    </form>
  `,
})
export class ProductForm {
  readonly product = input<Product | null>(null);
  readonly categories = input.required<Category[]>();
  readonly busy = input(false);
  readonly saved = output<ProductInput>();
  readonly cancelled = output<void>();
  protected readonly currencySymbol = QUETZAL_SYMBOL;
  protected readonly invalidName = signal(false);

  protected submit(event: Event) {
    event.preventDefault();
    if (this.busy() || !(event.currentTarget instanceof HTMLFormElement)) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    this.invalidName.set(!name);
    if (!name) return;
    this.saved.emit({
      name,
      description: String(data.get('description') ?? '').trim(),
      price: String(data.get('price') ?? '').replace(',', '.'),
      stock: Number(data.get('stock')),
      categoryId: String(data.get('categoryId') ?? ''),
    });
  }
}
