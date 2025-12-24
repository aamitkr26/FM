import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { CreateAlertInput, GetAlertsQuery } from './alerts.types';
import { broadcastAlert } from '../../websocket/broadcaster';

export class AlertService {
  /**
   * Create a new alert and broadcast it
   * SAFE even if vehicleId is missing or invalid
   */
  async createAlert(input: CreateAlertInput) {
    try {
      const alert = await prisma.alert.create({
        data: {
          vehicleId: input.vehicleId ?? null,
          type: input.type,
          severity: input.severity,
          title: input.title,
          message: input.message,
          metadata: input.metadata ?? {},
          resolved: false,
        },
        // IMPORTANT:
        // ❌ Do NOT include vehicle here
        // It can break if vehicleId is orphaned
      });

      logger.info(
        `Alert created: ${alert.type} | ${alert.severity} | ${alert.title}`
      );

      // Broadcast minimal safe payload
      broadcastAlert({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        createdAt: alert.createdAt,
      });

      return alert;
    } catch (error) {
      logger.error('Failed to create alert', error);
      throw error;
    }
  }

  /**
   * Get alerts with filters (FULLY SAFE)
   */
  async getAlerts(query: GetAlertsQuery) {
    const {
      vehicleId,
      type,
      severity,
      resolved,
      limit,
      startDate,
      endDate,
    } = query;

    const take =
      limit && !isNaN(Number(limit)) ? Number(limit) : 50;

    const where: any = {};

    if (vehicleId) where.vehicleId = vehicleId;
    if (type) where.type = type;
    if (severity) where.severity = severity;

    if (resolved !== undefined) {
      where.resolved =
        resolved === 'true' || resolved === true;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      // ❌ NO include vehicle
    });

    return alerts;
  }

  /**
   * Get alert by ID (SAFE)
   */
  async getAlertById(id: string) {
    return prisma.alert.findUnique({
      where: { id },
      // ❌ NO include vehicle
    });
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(id: string, resolvedBy?: string) {
    const alert = await prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedBy: resolvedBy ?? 'system',
        resolvedAt: new Date(),
      },
    });

    logger.info(
      `Alert resolved: ${alert.id} by ${resolvedBy ?? 'system'}`
    );

    return alert;
  }

  /**
   * Get alert statistics (SAFE on empty / dirty DB)
   */
  async getAlertStatistics(vehicleId?: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const baseWhere: any = {
      createdAt: { gte: since },
    };

    if (vehicleId) baseWhere.vehicleId = vehicleId;

    const [
      total,
      unresolved,
      critical,
      warning,
    ] = await Promise.all([
      prisma.alert.count({ where: baseWhere }),
      prisma.alert.count({
        where: { ...baseWhere, resolved: false },
      }),
      prisma.alert.count({
        where: { ...baseWhere, severity: 'critical' },
      }),
      prisma.alert.count({
        where: { ...baseWhere, severity: 'warning' },
      }),
    ]);

    return {
      total,
      unresolved,
      resolved: total - unresolved,
      critical,
      warning,
    };
  }
}
