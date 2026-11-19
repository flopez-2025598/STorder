import type { PoolClient } from 'pg';
import { pool } from '../config/database.ts';
import type { OrderInput } from '../dtos/catalog.dto.ts';
import type { OrderStatus } from '../models/order-status.ts';

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: string;
}

interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  createdAt: Date;
  total: string;
  items: OrderItem[];
}

const orderDetails = `
  SELECT orders.id, orders.customer_id AS "customerId", orders.status,
         orders.created_at AS "createdAt",
         COALESCE(SUM(order_items.quantity * order_items.unit_price), 0.00)::text AS total,
         COALESCE(jsonb_agg(jsonb_build_object(
           'productId', order_items.product_id, 'quantity', order_items.quantity,
           'unitPrice', order_items.unit_price::text
         ) ORDER BY order_items.product_id) FILTER (WHERE order_items.product_id IS NOT NULL), '[]') AS items
  FROM orders LEFT JOIN order_items ON order_items.order_id = orders.id`;

export async function lockProducts(client: PoolClient, productIds: string[]) {
  const { rows } = await client.query<{ id: string; stock: number }>(
    'SELECT id, stock FROM products WHERE id = ANY($1::uuid[]) ORDER BY id FOR UPDATE',
    [productIds],
  );
  return rows;
}

export async function insertOrder(client: PoolClient, customerId: string, items: OrderInput['items']) {
  const inserted = await client.query<{ id: string }>(
    'INSERT INTO orders (customer_id) VALUES ($1) RETURNING id', [customerId],
  );
  const order = inserted.rows[0];
  if (!order) throw new Error('PostgreSQL no devolvió el pedido creado');

  const ids = items.map(({ productId }) => productId);
  const quantities = items.map(({ quantity }) => quantity);
  await client.query(
    `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
     SELECT $1, product.id, requested.quantity, product.unit_price
     FROM unnest($2::uuid[], $3::integer[]) AS requested(id, quantity)
     JOIN products AS product ON product.id = requested.id`,
    [order.id, ids, quantities],
  );
  await client.query(
    `UPDATE products SET stock = products.stock - requested.quantity
     FROM unnest($1::uuid[], $2::integer[]) AS requested(id, quantity)
     WHERE products.id = requested.id`,
    [ids, quantities],
  );

  const { rows } = await client.query<Order>(
    `${orderDetails} WHERE orders.id = $1 GROUP BY orders.id`,
    [order.id],
  );
  const result = rows[0];
  if (!result) throw new Error('PostgreSQL no devolvió el detalle del pedido');
  return result;
}

export async function listOrders(customerId: string | null) {
  const { rows } = await pool.query<Order>(
    `${orderDetails}
     WHERE ($1::uuid IS NULL OR orders.customer_id = $1)
     GROUP BY orders.id ORDER BY orders.created_at DESC, orders.id`,
    [customerId],
  );
  return rows;
}

export async function findOrder(id: string, customerId: string | null) {
  const { rows } = await pool.query<Order>(
    `${orderDetails}
     WHERE orders.id = $1 AND ($2::uuid IS NULL OR orders.customer_id = $2)
     GROUP BY orders.id`,
    [id, customerId],
  );
  return rows[0];
}
