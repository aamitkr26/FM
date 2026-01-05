"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FuelService = void 0;
var _database = require("../../config/database");
class FuelService {
  async getEvents(params) {
    const where = {};
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    if (params.severity) where.severity = params.severity;
    if (params.eventType) where.eventType = params.eventType;
    if (params.startDate || params.endDate) {
      where.timestamp = {};
      if (params.startDate) where.timestamp.gte = new Date(params.startDate);
      if (params.endDate) where.timestamp.lte = new Date(params.endDate);
    }
    return _database.prisma.fuelEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: params.limit ?? 100,
      include: {
        vehicle: {
          select: {
            id: true,
            imei: true,
            registrationNo: true,
            make: true,
            model: true
          }
        }
      }
    });
  }
  async getTheftEvents(params) {
    const where = {
      severity: {
        in: ['red', 'yellow']
      },
      eventType: {
        in: ['THEFT', 'MANIPULATION', 'LOSS']
      }
    };
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    return _database.prisma.fuelEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: params.limit ?? 50,
      include: {
        vehicle: {
          select: {
            id: true,
            imei: true,
            registrationNo: true
          }
        }
      }
    });
  }
  async getStatistics(params) {
    const days = params.days ?? 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const where = {
      timestamp: {
        gte: startDate
      }
    };
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    const events = await _database.prisma.fuelEvent.findMany({
      where
    });
    const totalLoss = events.filter(e => (e.delta ?? 0) < 0).reduce((sum, e) => sum + Math.abs(e.delta ?? 0), 0);
    return {
      totalEvents: events.length,
      theftEvents: events.filter(e => e.eventType === 'THEFT').length,
      refillEvents: events.filter(e => e.eventType === 'REFILL').length,
      totalFuelLoss: totalLoss,
      suspiciousEvents: events.filter(e => e.severity === 'red' || e.severity === 'yellow').length,
      averageConsumption: events.length > 0 ? totalLoss / events.length : 0
    };
  }
}
exports.FuelService = FuelService;