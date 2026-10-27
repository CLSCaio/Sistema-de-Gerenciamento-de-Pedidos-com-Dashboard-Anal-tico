import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { authenticate } from '../src/middlewares/authenticate';
import { authorize } from '../src/middlewares/authorize';
import { errorHandler } from '../src/middlewares/error-handler';
import { signAccessToken } from '../src/utils/tokens';

function buildApp() {
  const app = express();
  app.get('/admin', authenticate, authorize('admin'), (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorHandler);
  return app;
}

describe('autenticação', () => {
  it('aceita um access token válido', async () => {
    const token = signAccessToken({ sub: 'user-1', email: 'admin@fastmeals.com', role: 'admin' });
    const response = await request(buildApp()).get('/admin').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it('rejeita um access token inválido com 401', async () => {
    const response = await request(buildApp()).get('/admin').set('Authorization', 'Bearer token-invalido');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('retorna 403 quando o perfil não tem permissão', async () => {
    const token = signAccessToken({ sub: 'user-2', email: 'viewer@fastmeals.com', role: 'viewer' });
    const response = await request(buildApp()).get('/admin').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
