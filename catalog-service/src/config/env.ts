import 'dotenv/config';
import { z } from 'zod';

export const serviceName = 'catalog-service';

const port = z.coerce.number().int().min(1).max(65535);
const schema = z.object({
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: port.default(3002),
  CORS_ORIGIN: z.url().default('http://localhost:4200'),
  AUTH_SERVICE_URL: z.url({ protocol: /^https?$/ }).default('http://127.0.0.1:3001'),
  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: port.default(5432),
  DB_NAME: z.literal('storder_catalog').default('storder_catalog'),
  DB_USER: z.string().min(1).default('storder_catalog_app'),
  DB_PASSWORD: z.string().min(1),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  const fields = result.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(`Configuración inválida de ${serviceName}: ${fields}`);
}

export const env = result.data;
