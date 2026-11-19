import cors from 'cors';
import express from 'express';
import { env } from './config/env.ts';
import { errorHandler } from './middlewares/errors.ts';
import { authRouter } from './routes/auth.routes.ts';
import { healthRouter } from './routes/health.routes.ts';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use((_request, response) => {
  response.status(404).json({ error: 'Ruta no encontrada' });
});
app.use(errorHandler);
