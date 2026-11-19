import { app } from './app.ts';
import { pool } from './config/database.ts';
import { env, serviceName } from './config/env.ts';

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`STorder ${serviceName}: http://${env.HOST}:${env.PORT}`);
});

function shutdown(): void {
  server.close((error) => {
    void pool.end().catch((poolError: unknown) => {
      console.error(poolError);
      process.exitCode = 1;
    });
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
