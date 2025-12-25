import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../config/logger';
import { authenticateSocket } from '../middleware/socketAuth';

export class WebSocketService {
  private io: SocketIOServer;

  constructor(server?: HttpServer, options?: any) {
    if (server && options) {
      this.io = new SocketIOServer(server, options);
    } else {
      this.io = new SocketIOServer({
        cors: {
          origin: process.env.FRONTEND_URL || "http://localhost:5173",
          methods: ["GET", "POST"],
          credentials: true
        },
        transports: ['websocket', 'polling']
      });
    }

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup middleware for WebSocket connections
   */
  private setupMiddleware() {
    // Authentication middleware
    this.io.use(authenticateSocket);
  }

  /**
   * Setup event handlers for WebSocket connections
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);

      // Join user to their company room
      const user = (socket as any).user;
      if (user && user.companyId) {
        socket.join(`company_${user.companyId}`);
        logger.info(`User ${user.email} joined company room: ${user.companyId}`);
      }

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
      });

      // Handle custom events
      socket.on('join_vehicle_room', (vehicleId: string) => {
        socket.join(`vehicle_${vehicleId}`);
        logger.debug(`Client ${socket.id} joined vehicle room: ${vehicleId}`);
      });

      socket.on('leave_vehicle_room', (vehicleId: string) => {
        socket.leave(`vehicle_${vehicleId}`);
        logger.debug(`Client ${socket.id} left vehicle room: ${vehicleId}`);
      });
    });
  }

  /**
   * Get Socket.IO server instance
   */
  getServer(): SocketIOServer {
    return this.io;
  }

  /**
   * Broadcast vehicle update to all connected clients
   */
  broadcastVehicleUpdate(data: {
    vehicleId: string;
    imei: string;
    lat: number;
    lng: number;
    speed: number;
    ignition: boolean;
    timestamp: Date;
    state: string;
  }) {
    try {
      this.io.emit('vehicle_update', data);
      logger.debug(`WebSocket broadcast: vehicle update for ${data.imei}`);
    } catch (error) {
      logger.error(`WebSocket broadcast error: ${error}`);
    }
  }

  /**
   * Broadcast new alert to all connected clients
   */
  broadcastAlert(alert: any) {
    try {
      this.io.emit('alert_new', {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        vehicleId: alert.vehicleId,
        vehicle: alert.vehicle,
        createdAt: alert.createdAt,
        metadata: alert.metadata,
      });

      logger.debug(`WebSocket broadcast: new alert ${alert.type}`);
    } catch (error) {
      logger.error(`WebSocket alert broadcast error: ${error}`);
    }
  }

  /**
   * Broadcast to specific company room
   */
  broadcastToCompany(companyId: string, event: string, data: any) {
    try {
      this.io.to(`company_${companyId}`).emit(event, data);
      logger.debug(`WebSocket broadcast to company ${companyId}: ${event}`);
    } catch (error) {
      logger.error(`WebSocket company broadcast error: ${error}`);
    }
  }

  /**
   * Broadcast to specific vehicle room
   */
  broadcastToVehicle(vehicleId: string, event: string, data: any) {
    try {
      this.io.to(`vehicle_${vehicleId}`).emit(event, data);
      logger.debug(`WebSocket broadcast to vehicle ${vehicleId}: ${event}`);
    } catch (error) {
      logger.error(`WebSocket vehicle broadcast error: ${error}`);
    }
  }
}

