"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AlertsService = void 0;
var _database = require("../../config/database");
class AlertsService {
  async getAll(params) {
    const where = {};
    if (params.resolved !== undefined) where.resolved = params.resolved;
    if (params.severity) where.severity = params.severity;
    const alerts = await _database.prisma.alert.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: params.limit,
      skip: params.offset,
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
    return alerts;
  }
  async getById(id) {
    return _database.prisma.alert.findUnique({
      where: {
        id
      },
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
  async resolve(id, resolvedBy) {
    return _database.prisma.alert.update({
      where: {
        id
      },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy
      },
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
  async unresolve(id) {
    return _database.prisma.alert.update({
      where: {
        id
      },
      data: {
        resolved: false,
        resolvedAt: null,
        resolvedBy: null
      },
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
}
exports.AlertsService = AlertsService;