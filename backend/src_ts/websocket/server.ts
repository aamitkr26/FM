import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';

let io: SocketIOServer | null = null;

const isLocalDevOrigin = (origin: string): boolean => {
  try {
    const u = new URL(origin);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

export function initWebSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
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
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    const token = (socket.handshake.auth as any)?.token;
    if (!token) {
      next(new Error('Unauthorized'));
      return;
    }

    try {
      const decoded = jwt.verify(String(token), env.auth.jwtSecret) as any;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('WebSocket client connected', { id: socket.id });
    socket.on('disconnect', (reason) => {
      logger.info('WebSocket client disconnected', { id: socket.id, reason });
    });
  });

  return io;
}

export function getIo() {
  return io;
}
