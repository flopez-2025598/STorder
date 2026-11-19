import type { RequestHandler } from 'express';
import { z } from 'zod';
import { env } from '../config/env.ts';
import type { CatalogUser } from '../models/catalog-user.ts';
import { HttpError } from '../models/http-error.ts';

declare module 'express-serve-static-core' {
  interface Request {
    catalogUser?: CatalogUser;
  }
}

const identitySchema = z.object({
  user: z.object({ id: z.uuid(), role: z.enum(['admin', 'operator']) }),
});

export const authenticate: RequestHandler = async (request, _response, next) => {
  const token = request.get('authorization')?.match(/^Bearer +([^\s,]+)$/i)?.[1];
  if (!token) throw new HttpError(401, 'Se requiere un token Bearer');

  let result: Response;
  try {
    result = await fetch(new URL('/api/auth/me', env.AUTH_SERVICE_URL), {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(2500),
      redirect: 'error',
    });
  } catch {
    throw new HttpError(503, 'Servicio de autenticación no disponible');
  }

  if (result.status === 401 || result.status === 404) {
    throw new HttpError(401, 'Token inválido o usuario no disponible');
  }
  if (!result.ok) throw new HttpError(503, 'Servicio de autenticación no disponible');

  const identity = identitySchema.safeParse(await result.json().catch(() => undefined));
  if (!identity.success) throw new HttpError(503, 'Respuesta de autenticación inválida');
  request.catalogUser = identity.data.user;
  next();
};

export const requireAdmin: RequestHandler = (request, _response, next) => {
  if (request.catalogUser?.role !== 'admin') throw new HttpError(403, 'Permisos insuficientes');
  next();
};
