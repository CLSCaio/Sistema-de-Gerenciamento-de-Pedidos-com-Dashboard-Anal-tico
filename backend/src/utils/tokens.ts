import { createHmac, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Role } from '../models/domain';
import { AppError } from './errors';
import { getEnv } from './env';

const ACCESS_TOKEN_SECONDS = 15 * 60;
const REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getEnv().jwtAccessSecret, { expiresIn: ACCESS_TOKEN_SECONDS });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, getEnv().jwtAccessSecret);
    if (!isAccessPayload(decoded)) {
      throw new AppError(401, 'UNAUTHORIZED', 'Token de acesso inválido');
    }
    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(401, 'UNAUTHORIZED', 'Token de acesso inválido ou expirado');
  }
}

export function createRefreshToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(48).toString('hex');
  return {
    token,
    tokenHash: hashRefreshToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
  };
}

export function hashRefreshToken(token: string): string {
  return createHmac('sha256', getEnv().jwtRefreshSecret).update(token).digest('hex');
}

function isAccessPayload(value: unknown): value is AccessTokenPayload {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.sub === 'string' &&
    typeof record.email === 'string' &&
    (record.role === 'admin' || record.role === 'viewer')
  );
}
