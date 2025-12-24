import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  /**
   * Get fleet statistics (GET /api/dashboard/statistics)
   */
  async getStatistics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getFleetStatistics();
      return res.json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get recent alerts (GET /api/dashboard/alerts)
   */
  async getRecentAlerts(_req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await dashboardService.getRecentAlerts();
      return res.json({
        success: true,
        message: 'Recent alerts retrieved successfully',
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
   * Get live vehicles (GET /api/dashboard/live)
   */
  async getLiveVehicles(_req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await dashboardService.getLiveVehicles();
      return res.json({
        success: true,
        message: 'Live vehicles retrieved successfully',
        data: {
          count: vehicles.length,
          vehicles
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get fuel statistics (GET /api/dashboard/fuel-stats)
   */
  async getFuelStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const stats = await dashboardService.getFuelStatistics(days);
      return res.json({
        success: true,
        message: 'Fuel statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get trip statistics (GET /api/dashboard/trip-stats)
   */
  async getTripStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const stats = await dashboardService.getTripStatistics(days);
      return res.json({
        success: true,
        message: 'Trip statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      return next(error);
    }
  }
}
