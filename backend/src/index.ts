import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/database';
import { getGPSPoller } from './gps/poller.service';
import { WebSocketService } from './websocket';

// Create Express app
const app = createApp();

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket service (single source of truth)
const wsService = new WebSocketService(server, {
  cors: {
    origin: env.cors.origins,
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// Make wsService available globally for broadcasting
export { wsService };

// GPS Poller instance
let gpsPoller: ReturnType<typeof getGPSPoller> | null = null;

// Start server
const PORT = env.server.port;

async function start() {
  // Start HTTP server first so the app can boot even if DB is temporarily down.
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`✓ Server running on port ${PORT}`);
    logger.info(`✓ Environment: ${env.server.env}`);
    logger.info(`✓ GPS Provider: ${env.gps.provider}`);
    logger.info(`✓ Health check: http://localhost:${PORT}/health`);
  });

  // Initialize DB + poller with retry (useful for local dev / Supabase setup).
  let pollerStarted = false;
  const tryInit = async () => {
    try {
      await prisma.$connect();
      logger.info('✓ Database connected');

      if (!pollerStarted) {
        gpsPoller = getGPSPoller();
        await gpsPoller.start();
        pollerStarted = true;
        logger.info('✓ GPS poller started');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : typeof error === 'string'
            ? error
            : String(error);

      logger.error(`Database unavailable (will retry): ${message}`);
      setTimeout(() => {
        void tryInit();
      }, 10_000);
    }
  };

  void tryInit();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    if (gpsPoller) await gpsPoller.stop();
    await prisma.$disconnect();
    logger.info('Server shut down');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(async () => {
    if (gpsPoller) await gpsPoller.stop();
    await prisma.$disconnect();
    logger.info('Server shut down');
    process.exit(0);
  });
});

// Start the application
start();
