import { Request, Response, NextFunction } from 'express';
import { VehicleService } from './vehicles.service';
import { CreateVehicleInput, UpdateVehicleInput, GetVehiclesQuery } from './vehicles.types';

const vehicleService = new VehicleService();

export class VehiclesController {
  /**
   * Create vehicle (POST /api/vehicles)
   */
  async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateVehicleInput = req.body;
      const vehicle = await vehicleService.createVehicle(input);

      res.status(201).json(vehicle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all vehicles (GET /api/vehicles)
   */
  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as GetVehiclesQuery;
      const vehicles = await vehicleService.getVehicles(query);

      res.json({
        count: vehicles.length,
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vehicle by ID (GET /api/vehicles/:id)
   */
  async getVehicleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.getVehicleById(id);

      res.json(vehicle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update vehicle (PUT /api/vehicles/:id)
   */
  async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input: UpdateVehicleInput = req.body;
      const vehicle = await vehicleService.updateVehicle(id, input);

      res.json(vehicle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete vehicle (DELETE /api/vehicles/:id)
   */
  async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await vehicleService.deleteVehicle(id);

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get vehicle statistics (GET /api/vehicles/statistics)
   */
  async getStatistics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await vehicleService.getVehicleStatistics();

      return res.json(stats);
    } catch (error) {
      return next(error);
    }
  }
}
