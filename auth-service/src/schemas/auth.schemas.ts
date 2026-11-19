import { z } from 'zod';

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());
const password = z.string().refine(
  (value) => Buffer.byteLength(value, 'utf8') <= 72,
  'La contraseña no puede superar 72 bytes en UTF-8',
);

export const registerSchema = z.strictObject({
  name: z.string().trim().min(1).max(100).refine((value) => !value.includes('\0')),
  email,
  password: password.min(8),
});

export const loginSchema = z.strictObject({
  email,
  password: password.min(1),
});
