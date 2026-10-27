import type { Request, Response } from 'express';
import { idParamSchema, loginSchema } from '../models/schemas';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/errors';
import { AuthService, clearRefreshCookie, setRefreshCookie } from '../services/auth-service';

function readRefreshCookie(req: Request): string | undefined {
  const value = req.cookies?.refreshToken;
  return typeof value === 'string' ? value : undefined;
}

export function createAuthController(service: AuthService) {
  return {
    login: asyncHandler(async (req, res) => {
      const result = await service.login(loginSchema.parse(req.body));
      setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
      res.json({ accessToken: result.accessToken, user: result.user });
    }),
    refresh: asyncHandler(async (req, res) => {
      const result = await service.refresh(readRefreshCookie(req));
      setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
      res.json({ accessToken: result.accessToken, user: result.user });
    }),
    logout: asyncHandler(async (req, res) => {
      await service.logout(readRefreshCookie(req));
      clearRefreshCookie(res);
      res.status(204).send();
    }),
    me: asyncHandler(async (req, res) => {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Token de acesso ausente');
      res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
    }),
  };
}

export function readId(req: Request): string {
  return idParamSchema.parse(req.params).id;
}

export function sendJson(res: Response, status: number, body: unknown): void {
  res.status(status).json(body);
}
