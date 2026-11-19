import type { RequestHandler } from 'express';
import type { AuthenticatedUser } from '../dtos/auth.dto.ts';
import { HttpError } from '../models/http-error.ts';
import { verifyToken } from '../services/token.service.ts';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthenticatedUser;
  }
}

export const authenticate: RequestHandler = (request, _response, next) => {
  const token = request.get('authorization')?.match(/^Bearer +([^\s,]+)$/i)?.[1];
  if (!token) {
    next(new HttpError(401, 'Se requiere un token Bearer'));
    return;
  }

  try {
    request.auth = verifyToken(token);
  } catch {
    next(new HttpError(401, 'Token inválido o vencido'));
    return;
  }

  next();
};
