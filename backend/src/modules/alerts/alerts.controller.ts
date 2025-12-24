import { Request, Response, NextFunction } from 'express';
import { AlertsService } from './alerts.service';

const alertsService = new AlertsService();

export class AlertsController {
  /**
   * Get all alerts (GET /api/alerts)
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { resolved, limit, offset } = req.query;
      
      const alerts = await alertsService.getAllAlerts({
        resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined
      });

      return res.json({
        success: true,
        message: 'Alerts retrieved successfully',
        data: {
          count: alerts.length,
          alerts
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get alert by ID (GET /api/alerts/:id)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const alert = await alertsService.getAlertById(id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found',
          data: null
        });
      }

      return res.json({
        success: true,
        message: 'Alert retrieved successfully',
        data: alert
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Resolve alert (PATCH /api/alerts/:id/resolve)
   */
  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const resolvedBy = (req as any).user?.email || 'system';
      
      const alert = await alertsService.resolveAlert(id, resolvedBy);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found',
          data: null
        });
      }

      return res.json({
        success: true,
        message: 'Alert resolved successfully',
        data: alert
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Unresolve alert (PATCH /api/alerts/:id/unresolve)
   */
  async unresolve(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const alert = await alertsService.unresolveAlert(id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found',
          data: null
        });
      }

      return res.json({
        success: true,
        message: 'Alert unresolved successfully',
        data: alert
      });
    } catch (error) {
      return next(error);
    }
  }
}
