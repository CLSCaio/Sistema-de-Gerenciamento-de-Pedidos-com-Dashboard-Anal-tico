import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../models/domain';
import { AppError } from '../utils/errors';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'UNAUTHORIZED', 'Token de acesso ausente'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'FORBIDDEN', 'Permissão insuficiente para esta operação'));
      return;
    }
    next();
  };
}
