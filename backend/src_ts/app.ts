import cors from 'cors';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

import authRoutes from './modules/auth/auth.routes';
import alertsRoutes from './modules/alerts/alerts.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import vehiclesRoutes from './modules/vehicles/vehicles.routes';
import telemetryRoutes from './modules/telemetry/telemetry.routes';
import fuelRoutes from './modules/fuel/fuel.routes';
import geofenceRoutes from './modules/geofence/geofence.routes';
import tripRoutes from './modules/trip/trip.routes';
import militrackRoutes from './modules/militrack/militrack.routes';

const isLocalDevOrigin = (origin: string): boolean => {
  try {
    const u = new URL(origin);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (env.cors.origins.includes(origin) || isLocalDevOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(express.json({ limit: '10mb' }));

  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.http(`${req.method} ${req.path}`);
    next();
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.server.nodeEnv,
    });
  });

  app.use('/api', apiLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/alerts', alertsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/vehicles', vehiclesRoutes);
  app.use('/api/telemetry', telemetryRoutes);
  app.use('/api/fuel', fuelRoutes);
  app.use('/api/geofence', geofenceRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/militrack', militrackRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
