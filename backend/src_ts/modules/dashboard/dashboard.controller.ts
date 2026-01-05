import { type NextFunction, type Request, type Response } from 'express';
import { DashboardService } from './dashboard.service';

const service = new DashboardService();

export class DashboardController {
  async statistics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await service.getStatistics();
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  }

  async alerts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
      const alerts = await service.getRecentAlerts(limit);
      res.json({ count: alerts.length, data: alerts });
    } catch (err) {
      next(err);
    }
  }

  async fuelStats(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(String(req.query.days), 10) : 7;
      const stats = await service.getFuelStats(days);
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  }

  async tripStats(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(String(req.query.days), 10) : 30;
      const stats = await service.getTripStats(days);
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  }

  async live(_req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await service.getLive();
      res.json({ count: vehicles.length, data: vehicles });
    } catch (err) {
      next(err);
    }
  }
}
