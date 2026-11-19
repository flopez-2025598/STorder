import type { z } from 'zod';
import type { categorySchema, orderSchema, productFiltersSchema, productSchema, productUpdateSchema } from '../schemas/catalog.schemas.ts';

export type CategoryInput = z.output<typeof categorySchema>;
export type ProductInput = z.output<typeof productSchema>;
export type ProductUpdate = z.output<typeof productUpdateSchema>;
export type ProductFilters = z.output<typeof productFiltersSchema>;
export type OrderInput = z.output<typeof orderSchema>;

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: string;
}
