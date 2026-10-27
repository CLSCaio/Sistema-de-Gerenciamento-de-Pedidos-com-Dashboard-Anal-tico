import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { errorHandler, notFound } from '../middlewares/error-handler';
import { rateLimiter } from '../middlewares/rate-limit';
import { createApiRouter } from '../routes';
import { getEnv } from './env';

export function createApp(): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: getEnv().corsOrigin, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimiter);
  app.use('/api', createApiRouter());
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
