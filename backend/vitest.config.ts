import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      DATABASE_URL: 'postgresql://fastmeals:fastmeals@localhost:5432/fastmeals',
      CORS_ORIGIN: 'http://localhost:3000',
    },
  },
});
