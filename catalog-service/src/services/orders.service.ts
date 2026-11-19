import { pool } from '../config/database.ts';
import type { OrderInput } from '../dtos/catalog.dto.ts';
import type { CatalogUser } from '../models/catalog-user.ts';
import { HttpError } from '../models/http-error.ts';
import * as repository from '../repositories/orders.repository.ts';

export async function placeOrder(input: OrderInput, customerId: string) {
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '1500ms'");
    const locked = await repository.lockProducts(client, input.items.map(({ productId }) => productId));
    const stockByProduct = new Map(locked.map(({ id, stock }) => [id, stock]));

    for (const { productId, quantity } of input.items) {
      const stock = stockByProduct.get(productId);
      if (stock === undefined) throw new HttpError(404, 'Producto del pedido no encontrado');
      if (stock < quantity) throw new HttpError(409, 'Existencias insuficientes');
    }

    const order = await repository.insertOrder(client, customerId, input.items);
    await client.query('COMMIT');
    return order;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      discard = true;
    }
    if (error instanceof Error && 'code' in error && error.code === '55P03') {
      throw new HttpError(503, 'El inventario está ocupado. Intenta nuevamente');
    }
    throw error;
  } finally {
    client.release(discard);
  }
}

export function getOrders(user: CatalogUser) {
  return repository.listOrders(user.role === 'admin' ? null : user.id);
}

export async function getOrder(id: string, user: CatalogUser) {
  const order = await repository.findOrder(id, user.role === 'admin' ? null : user.id);
  if (!order) throw new HttpError(404, 'Pedido no encontrado');
  return order;
}
