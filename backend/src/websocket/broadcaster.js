"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.broadcastAlertNew = broadcastAlertNew;
exports.broadcastVehicleUpdate = broadcastVehicleUpdate;
var _server = require("./server");
function broadcastVehicleUpdate(payload) {
  const io = (0, _server.getIo)();
  if (!io) return;
  io.emit('vehicle:update', payload);
  io.emit('vehicle_update', payload);
}
function broadcastAlertNew(alert) {
  const io = (0, _server.getIo)();
  if (!io) return;
  io.emit('alert:new', alert);
  io.emit('alert_created', alert);
}