import { z } from 'zod';
import { HttpError } from '../models/http-error.ts';

export const idSchema = z.uuid();
const text = (max: number) => z.string().trim().max(max).refine((value) => !value.includes('\0'));
const name = text(120).refine((value) => value.length > 0);
const quantity = z.number().int().min(0).max(2_147_483_647);
const price = z.union([z.string(), z.number()])
  .transform(String)
  .pipe(z.string().regex(/^\d{1,10}(\.\d{1,2})?$/));

export const categorySchema = z.strictObject({
  name,
  description: text(2000).optional(),
});

const productFields = {
  name,
  description: text(2000),
  price,
  stock: quantity,
  categoryId: idSchema,
};

export const productSchema = z.strictObject(productFields);
export const productUpdateSchema = z.strictObject(productFields).partial()
  .refine((value) => Object.keys(value).length > 0);
export const productFiltersSchema = z.strictObject({
  name: name.optional(),
  categoryId: idSchema.optional(),
});
export const stockSchema = z.strictObject({ stock: quantity });

export const orderSchema = z.strictObject({
  items: z.array(z.strictObject({
    productId: idSchema.transform((id) => id.toLowerCase()),
    quantity: quantity.min(1),
  })).min(1).max(100).refine((items) =>
    new Set(items.map(({ productId }) => productId)).size === items.length),
});

export function validate<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, 'Datos inválidos');
  return result.data;
}
