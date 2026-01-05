import { type NextFunction, type Request, type Response } from 'express';
import { FuelService } from './fuel.service';

const service = new FuelService();

export class FuelController {
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.query.vehicleId ? String(req.query.vehicleId) : undefined;
      const severity = req.query.severity ? String(req.query.severity) : undefined;
      const eventType = req.query.eventType ? String(req.query.eventType) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
      const endDate = req.query.endDate ? String(req.query.endDate) : undefined;

      const events = await service.getEvents({ vehicleId, severity, eventType, limit, startDate, endDate });
      res.json({ count: events.length, data: events });
    } catch (err) {
      next(err);
    }
  }

  async getByVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = String(req.params.vehicleId);
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const events = await service.getEvents({ vehicleId, limit });
      res.json({ count: events.length, data: events });
    } catch (err) {
      next(err);
    }
  }

  async getTheft(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.query.vehicleId ? String(req.query.vehicleId) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const events = await service.getTheftEvents({ vehicleId, limit });
      res.json({ count: events.length, data: events });
    } catch (err) {
      next(err);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.query.vehicleId ? String(req.query.vehicleId) : undefined;
      const days = req.query.days ? parseInt(String(req.query.days), 10) : undefined;
      const stats = await service.getStatistics({ vehicleId, days });
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
}
