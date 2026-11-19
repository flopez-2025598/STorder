import type { RequestHandler } from 'express';
import { pool } from '../config/database.ts';
import { serviceName } from '../config/env.ts';

export const health: RequestHandler = async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ service: serviceName, status: 'ok', database: 'up' });
  } catch (error) {
    console.error('No se pudo consultar PostgreSQL:', error instanceof Error ? error.message : error);
    response.status(503).json({ service: serviceName, status: 'unavailable', database: 'down' });
  }
};
