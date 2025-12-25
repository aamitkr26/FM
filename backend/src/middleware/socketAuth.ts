import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';

export function authenticateSocket(socket: any, next: any) {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, env.auth.jwtSecret) as any;
    
    // Attach user to socket
    socket.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId
    };

    logger.debug(`WebSocket authenticated: ${decoded.email}`);
    return next();
  } catch (error) {
    logger.warn(`WebSocket authentication failed: ${error}`);
    return next(new Error('Invalid authentication token'));
  }
}
