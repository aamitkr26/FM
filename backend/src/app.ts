import express, { type Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { logger } from './config/logger';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import vehicleRoutes from './modules/vehicles/vehicles.routes';
import telemetryRoutes from './modules/telemetry/telemetry.routes';
import fuelRoutes from './modules/fuel/fuel.routes';
import alertRoutes from './modules/alerts/alerts.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import geofenceRoutes from './modules/geofence/geofence.routes';
import tripRoutes from './modules/trip/trip.routes';

export function createApp(): Express {
  const app = express();

  // Trust proxy (for Render, Heroku, etc.)
  app.set('trust proxy', 1);

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser requests (no Origin header)
        if (!origin) return callback(null, true);

        if (env.cors.origins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, _res, next) => {
    logger.http(`${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint (no auth, no rate limit)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.server.env,
    });
  });

  // Apply rate limiting to all API routes
  app.use('/api', apiLimiter);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/telemetry', telemetryRoutes);
  app.use('/api/fuel', fuelRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/geofence', geofenceRoutes);
  app.use('/api/trips', tripRoutes);

  // 404 handler
  app.use(notFound);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
