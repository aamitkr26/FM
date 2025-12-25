// Note: This file is deprecated. Use wsService methods directly from the WebSocketService instance
// Import wsService from the index file where it's instantiated
import { wsService } from '../index';
import { logger } from '../config/logger';
import { WS_EVENTS } from '../utils/constants';

/**
 * Broadcast vehicle position update to all connected clients
 */
export function broadcastVehicleUpdate(data: {
  imei: string;
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number;
  ignition: boolean;
  timestamp: Date;
  state: string;
}) {
  try {
    wsService.broadcastVehicleUpdate(data);
    logger.debug(`WebSocket broadcast: vehicle update for ${data.imei}`);
  } catch (error) {
    logger.error(`WebSocket broadcast error: ${error}`);
  }
}

/**
 * Broadcast new alert to all connected clients
 */
export function broadcastAlert(alert: any) {
  try {
    wsService.broadcastAlert(alert);
    logger.debug(`WebSocket broadcast: new alert ${alert.type}`);
  } catch (error) {
    logger.error(`WebSocket alert broadcast error: ${error}`);
  }
}

/**
 * Broadcast dashboard update to all connected clients
 */
export function broadcastDashboardUpdate(data: {
  moving: number;
  stopped: number;
  idle: number;
  offline: number;
  alerts: number;
}) {
  try {
    wsService.getServer().emit(WS_EVENTS.DASHBOARD_UPDATE, data);
    logger.debug('WebSocket broadcast: dashboard update');
  } catch (error) {
    logger.error(`WebSocket dashboard broadcast error: ${error}`);
  }
}
