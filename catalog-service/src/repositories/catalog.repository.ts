import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.ts';
import type { Category, CategoryInput, Product, ProductFilters, ProductInput, ProductUpdate } from '../dtos/catalog.dto.ts';

const productColumns = 'id, sku, name, description, unit_price::text AS price, stock, category_id AS "categoryId"';

export async function listCategories(): Promise<Category[]> {
  const { rows } = await pool.query<Category>('SELECT id, name, description FROM categories ORDER BY name, id');
  return rows;
}

export async function createCategory(input: CategoryInput): Promise<Category | undefined> {
  const { rows } = await pool.query<Category>(
    `INSERT INTO categories (name, description) VALUES ($1, $2)
     ON CONFLICT DO NOTHING RETURNING id, name, description`,
    [input.name, input.description ?? null],
  );
  return rows[0];
}

export async function listProducts(filters: ProductFilters): Promise<Product[]> {
  const conditions: string[] = [];
  const values: string[] = [];

  if (filters.name !== undefined) {
    values.push(filters.name);
    conditions.push(`strpos(lower(name), lower($${values.length})) > 0`);
  }
  if (filters.categoryId !== undefined) {
    values.push(filters.categoryId);
    conditions.push(`category_id = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query<Product>(
    `SELECT ${productColumns} FROM products ${where} ORDER BY name, id`,
    values,
  );
  return rows;
}

export async function findProduct(id: string): Promise<Product | undefined> {
  const { rows } = await pool.query<Product>(`SELECT ${productColumns} FROM products WHERE id = $1`, [id]);
  return rows[0];
}

export async function createProduct(input: ProductInput): Promise<Product | undefined> {
  const { rows } = await pool.query<Product>(
    `INSERT INTO products (sku, name, description, unit_price, stock, category_id)
     SELECT $1, $2, $3, $4, $5, id FROM categories WHERE id = $6
     RETURNING ${productColumns}`,
    [randomUUID(), input.name, input.description, input.price, input.stock, input.categoryId],
  );
  return rows[0];
}

export async function updateProduct(id: string, input: ProductUpdate): Promise<Product | undefined> {
  const { rows } = await pool.query<Product>(
    `UPDATE products
     SET name = COALESCE($2, name), description = COALESCE($3, description),
         unit_price = COALESCE($4, unit_price), stock = COALESCE($5, stock),
         category_id = COALESCE($6, category_id)
     WHERE id = $1
     RETURNING ${productColumns}`,
    [id, input.name, input.description, input.price, input.stock, input.categoryId],
  );
  return rows[0];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount === 1;
}
