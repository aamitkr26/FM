import { prisma } from '../../config/database';
import { logger } from '../../config/logger';

export class VehiclesService {
  /**
   * Get all vehicles with optional filtering
   */
  async getAllVehicles(options: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const { status, limit, offset } = options;
      
      const whereClause: any = {};
      if (status) {
        whereClause.status = status;
      }

      const vehicles = await prisma.vehicle.findMany({
        where: whereClause,
        orderBy: { registrationNo: 'asc' },
        take: limit,
        skip: offset,
      });

      return vehicles || [];
    } catch (error) {
      logger.error(`Failed to get vehicles: ${error}`);
      throw error;
    }
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(id: string) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
      });

      return vehicle;
    } catch (error) {
      logger.error(`Failed to get vehicle by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Get vehicle statistics
   */
  async getVehicleStatistics() {
    try {
      const now = new Date();
      const offlineThreshold = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes

      // Get all vehicles
      const vehicles = await prisma.vehicle.findMany({
        where: { status: 'active' },
        select: {
          id: true,
          lastSeen: true,
          lastSpeed: true,
          lastIgnition: true,
        },
      });

      // Guard against empty vehicles array
      if (!vehicles || vehicles.length === 0) {
        return {
          total: 0,
          moving: 0,
          stopped: 0,
          idle: 0,
          offline: 0,
        };
      }

      // Calculate vehicle states
      let moving = 0;
      let stopped = 0;
      let idle = 0;
      let offline = 0;

      vehicles.forEach((vehicle) => {
        const lastSeen = vehicle.lastSeen;
        const lastSpeed = vehicle.lastSpeed ?? 0;
        const lastIgnition = vehicle.lastIgnition ?? false;
        
        if (!lastSeen || lastSeen < offlineThreshold) {
          offline++;
        } else {
          if (lastSpeed > 5) moving++;
          else if (lastIgnition && lastSpeed > 0) idle++;
          else stopped++;
        }
      });

      return {
        total: vehicles.length,
        moving,
        stopped,
        idle,
        offline,
      };
    } catch (error) {
      logger.error(`Failed to get vehicle statistics: ${error}`);
      throw error;
    }
  }

  /**
   * Create vehicle
   */
  async createVehicle(vehicleData: any) {
    try {
      const vehicle = await prisma.vehicle.create({
        data: vehicleData,
      });

      return vehicle;
    } catch (error) {
      logger.error(`Failed to create vehicle: ${error}`);
      throw error;
    }
  }

  /**
   * Update vehicle
   */
  async updateVehicle(id: string, vehicleData: any) {
    try {
      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: vehicleData,
      });

      return vehicle;
    } catch (error) {
      logger.error(`Failed to update vehicle: ${error}`);
      throw error;
    }
  }

  /**
   * Delete vehicle
   */
  async deleteVehicle(id: string) {
    try {
      const vehicle = await prisma.vehicle.delete({
        where: { id },
      });

      return vehicle;
    } catch (error) {
      logger.error(`Failed to delete vehicle: ${error}`);
      throw error;
    }
  }
}
