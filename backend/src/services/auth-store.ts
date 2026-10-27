import type { Role } from '../models/domain';
import { AppError } from '../utils/errors';
import { prisma } from '../utils/prisma';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface StoredRefreshToken {
  tokenHash: string;
  expiresAt: Date;
  user: StoredUser;
}

export interface AuthStore {
  findUserByEmail(email: string): Promise<StoredUser | null>;
  saveRefreshToken(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null>;
  deleteRefreshToken(tokenHash: string): Promise<void>;
}

export class PrismaAuthStore implements AuthStore {
  async findUserByEmail(email: string): Promise<StoredUser | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return { id: user.id, email: user.email, passwordHash: user.passwordHash, role: user.role };
  }

  async saveRefreshToken(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await prisma.refreshToken.create({ data: input });
  }

  async findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null> {
    const token = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!token) return null;
    return {
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      user: { id: token.user.id, email: token.user.email, passwordHash: token.user.passwordHash, role: token.user.role },
    };
  }

  async deleteRefreshToken(tokenHash: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }
}

export function assertRefreshToken(token: StoredRefreshToken | null): StoredRefreshToken {
  if (!token || token.expiresAt.getTime() <= Date.now()) {
    throw new AppError(401, 'UNAUTHORIZED', 'Refresh token inválido ou expirado');
  }
  return token;
}
