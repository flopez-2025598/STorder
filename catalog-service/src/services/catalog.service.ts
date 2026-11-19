import type { CategoryInput, ProductInput, ProductUpdate } from '../dtos/catalog.dto.ts';
import { HttpError } from '../models/http-error.ts';
import * as repository from '../repositories/catalog.repository.ts';

export { listCategories, listProducts } from '../repositories/catalog.repository.ts';

function isForeignKeyError(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === '23503';
}

export async function addCategory(input: CategoryInput) {
  const category = await repository.createCategory(input);
  if (!category) throw new HttpError(409, 'La categoría ya existe');
  return category;
}

export async function getProduct(id: string) {
  const product = await repository.findProduct(id);
  if (!product) throw new HttpError(404, 'Producto no encontrado');
  return product;
}

export async function addProduct(input: ProductInput) {
  const product = await repository.createProduct(input);
  if (!product) throw new HttpError(404, 'Categoría no encontrada');
  return product;
}

export async function editProduct(id: string, input: ProductUpdate) {
  try {
    const product = await repository.updateProduct(id, input);
    if (!product) throw new HttpError(404, 'Producto no encontrado');
    return product;
  } catch (error) {
    if (isForeignKeyError(error)) throw new HttpError(404, 'Categoría no encontrada');
    throw error;
  }
}

export async function removeProduct(id: string) {
  try {
    if (!await repository.deleteProduct(id)) throw new HttpError(404, 'Producto no encontrado');
  } catch (error) {
    if (isForeignKeyError(error)) throw new HttpError(409, 'El producto forma parte de un pedido');
    throw error;
  }
}
