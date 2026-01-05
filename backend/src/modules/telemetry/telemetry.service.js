"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TelemetryService = void 0;
var _database = require("../../config/database");
class TelemetryService {
  async createTelemetry(vehicleId, payload) {
    return _database.prisma.telemetry.create({
      data: {
        vehicleId,
        timestamp: payload.timestamp,
        latitude: payload.latitude,
        longitude: payload.longitude,
        speed: payload.speed,
        ignition: payload.ignition,
        motion: payload.motion,
        fuelLevel: payload.fuelLevel,
        odometer: payload.odometer,
        power: payload.power,
        raw: payload.raw
      }
    });
  }
  async updateVehiclePosition(vehicleId, payload) {
    await _database.prisma.vehicle.update({
      where: {
        id: vehicleId
      },
      data: {
        lastLat: payload.latitude,
        lastLng: payload.longitude,
        lastSeen: payload.timestamp,
        lastSpeed: payload.speed,
        lastIgnition: payload.ignition,
        ...(payload.odometer !== undefined ? {
          dashOdometer: payload.odometer
        } : {})
      }
    });
  }
  async getTelemetryByVehicle(vehicleId, options) {
    const where = {
      vehicleId
    };
    if (options.startDate || options.endDate) {
      where.timestamp = {};
      if (options.startDate) where.timestamp.gte = options.startDate;
      if (options.endDate) where.timestamp.lte = options.endDate;
    }
    return _database.prisma.telemetry.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: options.limit ?? 100
    });
  }
  async getLatestTelemetry(vehicleId) {
    return _database.prisma.telemetry.findFirst({
      where: {
        vehicleId
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }
  async getLatestTelemetryForAllVehicles() {
    const vehicles = await _database.prisma.vehicle.findMany({
      select: {
        id: true
      }
    });
    const latest = await Promise.all(vehicles.map(v => this.getLatestTelemetry(v.id)));
    return latest.filter(Boolean);
  }
}
exports.TelemetryService = TelemetryService;