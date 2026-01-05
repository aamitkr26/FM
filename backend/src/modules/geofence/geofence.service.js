"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GeofenceService = void 0;
var _database = require("../../config/database");
class GeofenceService {
  async getAll() {
    return _database.prisma.geofence.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
  async getById(id) {
    return _database.prisma.geofence.findUnique({
      where: {
        id
      }
    });
  }
  async create(data) {
    return _database.prisma.geofence.create({
      data
    });
  }
  async update(id, data) {
    return _database.prisma.geofence.update({
      where: {
        id
      },
      data
    });
  }
  async delete(id) {
    return _database.prisma.geofence.delete({
      where: {
        id
      }
    });
  }
  async getAlerts(params) {
    const where = {};
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    if (params.resolved !== undefined) where.resolved = params.resolved;
    return _database.prisma.geofenceAlert.findMany({
      where,
      include: {
        geofence: true,
        vehicle: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: params.limit ?? 100
    });
  }
}
exports.GeofenceService = GeofenceService;