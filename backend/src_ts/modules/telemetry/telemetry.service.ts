import { prisma } from '../../config/database';
import { type TelemetryInput } from './telemetry.types';

export class TelemetryService {
  async createTelemetry(vehicleId: string, payload: Omit<TelemetryInput, 'timestamp'> & { timestamp: Date }) {
    return prisma.telemetry.create({
      data: {
        vehicleId,
        timestamp: payload.timestamp,
        latitude: payload.latitude,
        longitude: payload.longitude,
        speed: payload.speed,
        ignition: payload.ignition,
        motion: payload.motion,
        fuelLevel: payload.fuelLevel,
        odometer: payload.odometer,
        power: payload.power,
        raw: payload.raw,
      },
    });
  }

  async updateVehiclePosition(vehicleId: string, payload: { timestamp: Date } & TelemetryInput) {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        lastLat: payload.latitude,
        lastLng: payload.longitude,
        lastSeen: payload.timestamp,
        lastSpeed: payload.speed,
        lastIgnition: payload.ignition,
        ...(payload.odometer !== undefined ? { dashOdometer: payload.odometer } : {}),
      },
    });
  }

  async getTelemetryByVehicle(vehicleId: string, options: { limit?: number; startDate?: Date; endDate?: Date }) {
    const where: any = { vehicleId };
    if (options.startDate || options.endDate) {
      where.timestamp = {};
      if (options.startDate) where.timestamp.gte = options.startDate;
      if (options.endDate) where.timestamp.lte = options.endDate;
    }

    return prisma.telemetry.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options.limit ?? 100,
    });
  }

  async getLatestTelemetry(vehicleId: string) {
    return prisma.telemetry.findFirst({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getLatestTelemetryForAllVehicles() {
    const vehicles = await prisma.vehicle.findMany({ select: { id: true } });
    const latest = await Promise.all(vehicles.map((v: { id: string }) => this.getLatestTelemetry(v.id)));
    return latest.filter(Boolean);
  }
}
