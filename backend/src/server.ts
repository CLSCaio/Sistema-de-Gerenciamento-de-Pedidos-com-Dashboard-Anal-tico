import './utils/local-env';
import 'dotenv/config';
import { createApp } from './utils/create-app';
import { getEnv } from './utils/env';

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  const env = getEnv();
  if (!env.databaseUrl) {
    throw new Error('Missing environment variable DATABASE_URL');
  }
  app.listen(env.port, () => {
    console.info(`FastMeals API listening on port ${env.port}`);
  });
}

export { app };
