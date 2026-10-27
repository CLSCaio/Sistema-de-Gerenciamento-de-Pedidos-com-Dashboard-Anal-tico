import type { Response } from 'express';
import type { PublicUser } from '../models/records';
import type { LoginInput } from '../models/schemas';
import { getEnv } from '../utils/env';
import { AppError } from '../utils/errors';
import { verifyPassword } from '../utils/password';
import { createRefreshToken, hashRefreshToken, signAccessToken } from '../utils/tokens';
import { assertRefreshToken, type AuthStore } from './auth-store';

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
  refreshToken: string;
  refreshExpiresAt: Date;
}

export class AuthService {
  constructor(private readonly store: AuthStore) {}

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.store.findUserByEmail(input.email.toLowerCase());
    const passwordMatches = user ? await verifyPassword(input.password, user.passwordHash) : false;
    if (!user || !passwordMatches) {
      throw new AppError(401, 'UNAUTHORIZED', 'Credenciais inválidas');
    }
    return this.issue(user);
  }

  async refresh(rawToken: string | undefined): Promise<AuthResult> {
    if (!rawToken) throw new AppError(401, 'UNAUTHORIZED', 'Refresh token ausente');
    const current = assertRefreshToken(await this.store.findRefreshToken(hashRefreshToken(rawToken)));
    await this.store.deleteRefreshToken(current.tokenHash);
    return this.issue(current.user);
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (rawToken) await this.store.deleteRefreshToken(hashRefreshToken(rawToken));
  }

  private async issue(user: { id: string; email: string; role: PublicUser['role'] }): Promise<AuthResult> {
    const refresh = createRefreshToken();
    await this.store.saveRefreshToken({ userId: user.id, tokenHash: refresh.tokenHash, expiresAt: refresh.expiresAt });
    return {
      accessToken: signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      user: { id: user.id, email: user.email, role: user.role },
      refreshToken: refresh.token,
      refreshExpiresAt: refresh.expiresAt,
    };
  }
}

export function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: getEnv().cookieSecure,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/api/auth',
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie('refreshToken', { path: '/api/auth', sameSite: 'lax', secure: getEnv().cookieSecure, httpOnly: true });
}
