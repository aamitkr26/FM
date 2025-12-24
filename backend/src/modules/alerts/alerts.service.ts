import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { CreateAlertInput, GetAlertsQuery } from './alerts.types';
import { broadcastAlert } from '../../websocket/broadcaster';

export class AlertService {
  /**
   * Create a new alert and broadcast it
   */
  async createAlert(input: CreateAlertInput) {
    try {
      const alert = await prisma.alert.create({
        data: {
          vehicleId: input.vehicleId,
          type: input.type,
          severity: input.severity,
          title: input.title,
          message: input.message,
          metadata: input.metadata,
        },
        include: {
          vehicle: {
            select: {
              id: true,
              imei: true,
              registrationNo: true,
            },
          },
        },
      });

      logger.info(`Alert created: ${alert.type} - ${alert.severity} - ${alert.title}`);

      // Broadcast alert to WebSocket clients
      broadcastAlert(alert);

      return alert;
    } catch (error) {
      logger.error(`Failed to create alert: ${error}`);
      throw error;
    }
  }

  /**
   * Get alerts with filters
   */
  async getAlerts(query: GetAlertsQuery) {
    const {
      vehicleId,
      type,
      severity,
      resolved,
      limit = 100,
      startDate,
      endDate,
    } = query;

    const where: any = {};

    if (vehicleId) where.vehicleId = vehicleId;
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (resolved !== undefined) where.resolved = Boolean(resolved);

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit) || 100,
      include: {
        vehicle: {
          select: {
            id: true,
            imei: true,
            registrationNo: true,
            make: true,
            model: true,
          },
        },
      },
    });

    return alerts;
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: string) {
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            imei: true,
            registrationNo: true,
          },
        },
      },
    });

    return alert;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(id: string, resolvedBy?: string) {
    const alert = await prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedBy,
        resolvedAt: new Date(),
      },
    });

    logger.info(`Alert resolved: ${alert.id} by ${resolvedBy || 'system'}`);

    return alert;
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics(vehicleId?: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      createdAt: { gte: startDate },
    };

    if (vehicleId) where.vehicleId = vehicleId;

    const [total, unresolved, critical, warnings] = await Promise.all([
      prisma.alert.count({ where }),
      prisma.alert.count({ where: { ...where, resolved: false } }),
      prisma.alert.count({ where: { ...where, severity: 'critical' } }),
      prisma.alert.count({ where: { ...where, severity: 'warning' } }),
    ]);

    return {
      total,
      unresolved,
      critical,
      warnings,
      resolved: total - unresolved,
    };
  }
}
