import { type NextFunction, type Request, type Response } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  readonly statusCode: number;
  readonly expose: boolean;

  constructor(message: string, statusCode: number, expose: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.expose = expose;
  }
}

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const appError = err instanceof AppError ? err : null;
  const status = appError?.statusCode ?? 500;

  const message =
    appError?.expose === false
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Internal server error';

  if (status >= 500) {
    logger.error('Unhandled error', { err });
  }

  res.status(status).json({ message });
};
