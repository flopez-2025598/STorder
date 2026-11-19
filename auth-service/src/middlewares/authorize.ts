import type { RequestHandler } from 'express';
import { HttpError } from '../models/http-error.ts';
import type { RoleName } from '../models/role.ts';
import { getActiveUser } from '../services/auth.service.ts';

export function requireRole(role: RoleName): RequestHandler {
  return async (request, _response, next) => {
    if (!request.auth) throw new HttpError(401, 'Se requiere autenticación');
    if (request.auth.role !== role) throw new HttpError(403, 'Permisos insuficientes');

    const user = await getActiveUser(request.auth.id);
    if (user.role !== role) throw new HttpError(403, 'Permisos insuficientes');

    next();
  };
}
