import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof SyntaxError && 'type' in error && error.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'JSON inválido' });
    return;
  }

  console.error(error);
  response.status(500).json({ error: 'Error interno del servidor' });
};
