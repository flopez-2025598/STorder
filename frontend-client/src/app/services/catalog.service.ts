import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Category, Order, OrderSelection, Product, ProductFilters, ProductInput, Stock } from '../models/api';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.catalogApiUrl;

  categories() {
    return this.http.get<{ categories: Category[] }>(this.base + '/categories').pipe(map(({ categories }) => categories));
  }

  createCategory(input: { name: string; description: string }) {
    return this.http.post<{ category: Category }>(this.base + '/categories', input);
  }

  products(filters: ProductFilters = {}) {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    return this.http.get<{ products: Product[] }>(this.base + '/products', { params }).pipe(map(({ products }) => products));
  }

  createProduct(input: ProductInput) {
    return this.http.post<{ product: Product }>(this.base + '/products', input);
  }

  updateProduct(id: string, input: ProductInput) {
    return this.http.patch<{ product: Product }>(this.base + '/products/' + id, input);
  }

  deleteProduct(id: string) {
    return this.http.delete<void>(this.base + '/products/' + id);
  }

  stock(id: string) {
    return this.http.get<Stock>(this.base + '/products/' + id + '/stock');
  }

  updateStock(id: string, stock: number) {
    return this.http.patch<Stock>(this.base + '/products/' + id + '/stock', { stock });
  }

  createOrder(items: OrderSelection[]) {
    return this.http.post<{ order: Order }>(this.base + '/orders', { items }).pipe(map(({ order }) => order));
  }

  orders() {
    return this.http.get<{ orders: Order[] }>(this.base + '/orders').pipe(map(({ orders }) => orders));
  }
}
