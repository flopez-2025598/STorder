import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../models/http-error.ts';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message });
    return;
  }

  if (error instanceof SyntaxError && 'type' in error && error.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'JSON inválido' });
    return;
  }

  console.error('Error interno en auth-service', error instanceof Error ? error.name : 'Error desconocido');
  response.status(500).json({ error: 'Error interno del servidor' });
};
