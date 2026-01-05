"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TelemetryController = void 0;
var _database = require("../../config/database");
var _broadcaster = require("../../websocket/broadcaster");
var _telemetry = require("./telemetry.service");
const service = new _telemetry.TelemetryService();
class TelemetryController {
  async ingest(req, res, next) {
    try {
      const input = req.body;
      const timestamp = input.timestamp instanceof Date ? input.timestamp : new Date(input.timestamp);
      const vehicle = await _database.prisma.vehicle.findUnique({
        where: {
          imei: input.imei
        }
      });
      if (vehicle) {
        const payload = {
          ...input,
          timestamp
        };
        await service.createTelemetry(vehicle.id, payload);
        await service.updateVehiclePosition(vehicle.id, payload);
        (0, _broadcaster.broadcastVehicleUpdate)({
          vehicleId: vehicle.id,
          imei: vehicle.imei,
          registrationNo: vehicle.registrationNo,
          lastLat: payload.latitude,
          lastLng: payload.longitude,
          lastSpeed: payload.speed,
          lastIgnition: payload.ignition,
          lastSeen: payload.timestamp
        });
      }
      res.status(202).json({
        message: 'Telemetry received',
        imei: input.imei,
        timestamp
      });
    } catch (err) {
      next(err);
    }
  }
  async ingestPhone(req, res, next) {
    try {
      const input = req.body;
      const user = req.user;
      if (!user?.id) {
        res.status(401).json({
          message: 'Unauthorized'
        });
        return;
      }
      const timestamp = input.timestamp instanceof Date ? input.timestamp : new Date(input.timestamp);
      let vehicle = null;
      if (input.vehicleId) {
        vehicle = await _database.prisma.vehicle.findUnique({
          where: {
            id: input.vehicleId
          }
        });
        if (!vehicle) {
          res.status(404).json({
            message: 'Vehicle not found'
          });
          return;
        }
        const role = String(user.role || '');
        const isPrivileged = role === 'admin' || role === 'supervisor';
        if (!isPrivileged && vehicle.ownerId && vehicle.ownerId !== user.id) {
          res.status(403).json({
            message: 'Forbidden'
          });
          return;
        }
      }
      if (!vehicle) {
        vehicle = await _database.prisma.vehicle.findFirst({
          where: {
            ownerId: user.id
          }
        });
      }
      if (!vehicle) {
        const imei = `PHONE-${user.id}`;
        vehicle = await _database.prisma.vehicle.upsert({
          where: {
            imei
          },
          update: {
            ownerId: user.id
          },
          create: {
            imei,
            registrationNo: `PHONE-${user.id}`,
            ownerId: user.id,
            make: 'Phone',
            model: 'GPS'
          }
        });
      }
      const rawBase = input.raw;
      const raw = input.accuracy !== undefined ? {
        ...(rawBase && typeof rawBase === 'object' && !Array.isArray(rawBase) ? rawBase : {
          raw: rawBase
        }),
        accuracy: input.accuracy,
        source: 'PHONE_GPS'
      } : rawBase;
      const payload = {
        imei: vehicle.imei,
        timestamp,
        latitude: input.latitude,
        longitude: input.longitude,
        speed: input.speed,
        ignition: input.ignition,
        motion: input.motion,
        fuelLevel: undefined,
        odometer: undefined,
        power: undefined,
        raw
      };
      await service.createTelemetry(vehicle.id, payload);
      await service.updateVehiclePosition(vehicle.id, payload);
      (0, _broadcaster.broadcastVehicleUpdate)({
        vehicleId: vehicle.id,
        imei: vehicle.imei,
        registrationNo: vehicle.registrationNo,
        lastLat: payload.latitude,
        lastLng: payload.longitude,
        lastSpeed: payload.speed,
        lastIgnition: payload.ignition,
        lastSeen: payload.timestamp
      });
      res.status(202).json({
        message: 'Telemetry received',
        vehicleId: vehicle.id,
        timestamp
      });
    } catch (err) {
      next(err);
    }
  }
  async getTelemetryByVehicle(req, res, next) {
    try {
      const vehicleId = String(req.params.vehicleId);
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
      const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
      const telemetries = await service.getTelemetryByVehicle(vehicleId, {
        limit,
        startDate,
        endDate
      });
      res.json({
        count: telemetries.length,
        data: telemetries
      });
    } catch (err) {
      next(err);
    }
  }
  async getLatestTelemetry(req, res, next) {
    try {
      const vehicleId = String(req.params.vehicleId);
      const telemetry = await service.getLatestTelemetry(vehicleId);
      if (!telemetry) {
        res.status(404).json({
          message: 'No telemetry data found'
        });
        return;
      }
      res.json({
        data: telemetry
      });
    } catch (err) {
      next(err);
    }
  }
  async getAllLatestTelemetry(_req, res, next) {
    try {
      const telemetries = await service.getLatestTelemetryForAllVehicles();
      res.json({
        count: telemetries.length,
        data: telemetries
      });
    } catch (err) {
      next(err);
    }
  }
}
exports.TelemetryController = TelemetryController;