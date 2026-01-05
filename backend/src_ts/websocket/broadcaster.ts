import { getIo } from './server';

export function broadcastVehicleUpdate(payload: any) {
  const io = getIo();
  if (!io) return;
  io.emit('vehicle:update', payload);
  io.emit('vehicle_update', payload);
}

export function broadcastAlertNew(alert: any) {
  const io = getIo();
  if (!io) return;
  io.emit('alert:new', alert);
  io.emit('alert_created', alert);
}
