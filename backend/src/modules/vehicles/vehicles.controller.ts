import { Request, Response, NextFunction } from 'express';
import { VehiclesService } from './vehicles.service';

const vehiclesService = new VehiclesService();

export class VehiclesController {
  /**
   * Get all vehicles (GET /api/vehicles)
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, limit, offset } = req.query;
      
      const vehicles = await vehiclesService.getAllVehicles({
        status: status as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined
      });

      return res.json({
        success: true,
        message: 'Vehicles retrieved successfully',
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
   * Get vehicle by ID (GET /api/vehicles/:id)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vehicle = await vehiclesService.getVehicleById(id);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
          data: null
        });
      }

      return res.json({
        success: true,
        message: 'Vehicle retrieved successfully',
        data: vehicle
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get vehicle statistics (GET /api/vehicles/statistics)
   */
  async getStatistics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await vehiclesService.getVehicleStatistics();
      return res.json({
        success: true,
        message: 'Vehicle statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Create vehicle (POST /api/vehicles)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleData = req.body;
      const vehicle = await vehiclesService.createVehicle(vehicleData);

      return res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update vehicle (PUT /api/vehicles/:id)
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vehicleData = req.body;
      
      const vehicle = await vehiclesService.updateVehicle(id, vehicleData);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
          data: null
        });
      }

      return res.json({
        success: true,
        message: 'Vehicle updated successfully',
        data: vehicle
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete vehicle (DELETE /api/vehicles/:id)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await vehiclesService.deleteVehicle(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
          data: null
        });
      }

      return res.json({
        success: true,
        message: 'Vehicle deleted successfully',
        data: result
      });
    } catch (error) {
      return next(error);
    }
  }
}
