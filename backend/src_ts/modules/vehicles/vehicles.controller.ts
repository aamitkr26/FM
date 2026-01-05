import { type NextFunction, type Request, type Response } from 'express';
import { VehiclesService } from './vehicles.service';

const service = new VehiclesService();

export class VehiclesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const offset = req.query.offset ? parseInt(String(req.query.offset), 10) : undefined;

      const vehicles = await service.getAll({ status, limit, offset });
      res.json({ count: vehicles.length, data: vehicles });
    } catch (err) {
      next(err);
    }
  }

  async getStatistics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await service.getStatistics();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  async getPositions(_req: Request, res: Response, next: NextFunction) {
    try {
      const positions = await service.getPositions();
      res.json({ count: positions.length, data: positions });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const vehicle = await service.getById(id);
      if (!vehicle) {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      res.json({ data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await service.create(req.body);
      res.status(201).json({ data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const vehicle = await service.update(id, req.body);
      res.json({ data: vehicle });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const vehicle = await service.delete(id);
      res.json({ data: vehicle });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      next(err);
    }
  }
}
