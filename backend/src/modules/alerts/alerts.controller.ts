import { Request, Response, NextFunction } from 'express';
import { AlertService } from './alerts.service';
import { GetAlertsQuery } from './alerts.types';
import { AuthRequest } from '../../middleware/auth';

const alertService = new AlertService();

export class AlertsController {
  /**
   * GET /api/alerts
   */
  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as GetAlertsQuery;
      const alerts = await alertService.getAlerts(query);

      res.json({
        count: alerts.length,
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/alerts/:id
   */
  async getAlertById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const alert = await alertService.getAlertById(id);

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      res.json(alert);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/alerts/:id/resolve
   */
  async resolveAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const resolvedBy = req.user?.email ?? 'system';

      const alert = await alertService.resolveAlert(id, resolvedBy);

      res.json({
        message: 'Alert resolved successfully',
        alert,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/alerts/statistics
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId, days } = req.query;

      const stats = await alertService.getAlertStatistics(
        vehicleId ? String(vehicleId) : undefined,
        days ? Number(days) : undefined
      );

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}