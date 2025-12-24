import { prisma } from '../../config/database';
import { logger } from '../../config/logger';

export class AlertsService {
  /**
   * Get all alerts with optional filtering
   */
  async getAllAlerts(options: {
    resolved?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      const { resolved, limit, offset } = options;
      
      const whereClause: any = {};
      if (resolved !== undefined) {
        whereClause.resolved = resolved;
      }

      const alerts = await prisma.alert.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
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

      return alerts || [];
    } catch (error) {
      logger.error(`Failed to get alerts: ${error}`);
      throw error;
    }
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: string) {
    try {
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
    } catch (error) {
      logger.error(`Failed to get alert by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Create alert
   */
  async createAlert(alertData: any) {
    try {
      const alert = await prisma.alert.create({
        data: alertData,
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
    } catch (error) {
      logger.error(`Failed to create alert: ${error}`);
      throw error;
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(id: string, resolvedBy: string) {
    try {
      const alert = await prisma.alert.update({
        where: { id },
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
              registrationNo: true,
            },
          },
        },
      });

      return alert;
    } catch (error) {
      logger.error(`Failed to resolve alert: ${error}`);
      throw error;
    }
  }

  /**
   * Unresolve alert
   */
  async unresolveAlert(id: string) {
    try {
      const alert = await prisma.alert.update({
        where: { id },
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
              registrationNo: true,
            },
          },
        },
      });

      return alert;
    } catch (error) {
      logger.error(`Failed to unresolve alert: ${error}`);
      throw error;
    }
  }
}
