import { prisma } from '../../config/database';

export class TripService {
  async getAll(params: { limit?: number; status?: string }) {
    const where: any = {};
    if (params.status) where.status = params.status;

    return prisma.trip.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: params.limit ?? 100,
      include: { vehicle: true },
    });
  }

  async getByVehicle(vehicleId: string, params: { limit?: number; status?: string }) {
    const where: any = { vehicleId };
    if (params.status) where.status = params.status;

    return prisma.trip.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: params.limit ?? 100,
      include: { vehicle: true },
    });
  }

  async getById(id: string) {
    return prisma.trip.findUnique({ where: { id }, include: { vehicle: true } });
  }
}
