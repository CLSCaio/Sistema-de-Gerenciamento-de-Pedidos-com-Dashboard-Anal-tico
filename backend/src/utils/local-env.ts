import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const localDatabasePassword = 'fastmeals';

const envFile = path.resolve(__dirname, '../../.env');

const contents = `DATABASE_URL=postgresql://fastmeals:${localDatabasePassword}@localhost:5433/fastmeals
LOCAL_PG_PASSWORD=${localDatabasePassword}
JWT_ACCESS_SECRET=dev-access-secret-change-me
JWT_REFRESH_SECRET=dev-refresh-secret-change-me
PORT=3001
CORS_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
NODE_ENV=development
`;

export function ensureLocalEnv(): void {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') return;
  if (existsSync(envFile)) return;
  writeFileSync(envFile, contents, 'utf8');
  console.info('backend/.env criado. Senha do Postgres local: fastmeals');
}

ensureLocalEnv();
