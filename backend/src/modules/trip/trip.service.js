"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TripService = void 0;
var _database = require("../../config/database");
class TripService {
  async getAll(params) {
    const where = {};
    if (params.status) where.status = params.status;
    return _database.prisma.trip.findMany({
      where,
      orderBy: {
        startTime: 'desc'
      },
      take: params.limit ?? 100,
      include: {
        vehicle: true
      }
    });
  }
  async getByVehicle(vehicleId, params) {
    const where = {
      vehicleId
    };
    if (params.status) where.status = params.status;
    return _database.prisma.trip.findMany({
      where,
      orderBy: {
        startTime: 'desc'
      },
      take: params.limit ?? 100,
      include: {
        vehicle: true
      }
    });
  }
  async getById(id) {
    return _database.prisma.trip.findUnique({
      where: {
        id
      },
      include: {
        vehicle: true
      }
    });
  }
}
exports.TripService = TripService;