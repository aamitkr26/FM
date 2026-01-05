import { type NextFunction, type Request, type Response } from 'express';
import { AlertsService } from './alerts.service';

const service = new AlertsService();

export class AlertsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const resolved =
        req.query.resolved === 'true'
          ? true
          : req.query.resolved === 'false'
            ? false
            : undefined;

      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const offset = req.query.offset ? parseInt(String(req.query.offset), 10) : undefined;
      const severity = req.query.severity ? String(req.query.severity) : undefined;

      const alerts = await service.getAll({ resolved, limit, offset, severity });
      res.json({ count: alerts.length, data: alerts });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const alert = await service.getById(id);
      if (!alert) {
        res.status(404).json({ message: 'Alert not found' });
        return;
      }

      res.json({ data: alert });
    } catch (err) {
      next(err);
    }
  }

  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const resolvedBy = req.user?.email ?? 'system';
      const alert = await service.resolve(id, resolvedBy);
      res.json({ count: 1, data: [alert] });
    } catch (err) {
      next(err);
    }
  }

  async unresolve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const alert = await service.unresolve(id);
      res.json({ count: 1, data: [alert] });
    } catch (err) {
      next(err);
    }
  }
}
