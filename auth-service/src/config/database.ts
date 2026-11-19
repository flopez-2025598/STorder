import pg from 'pg';
import { env } from './env.ts';

export const pool = new pg.Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  connectionTimeoutMillis: 2000,
  query_timeout: 2000,
});

pool.on('error', (error: Error) => {
  console.error('Error de conexión PostgreSQL:', error.message);
});
