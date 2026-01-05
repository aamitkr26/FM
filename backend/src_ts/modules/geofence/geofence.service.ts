import { prisma } from '../../config/database';

export class GeofenceService {
  async getAll() {
    return prisma.geofence.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    return prisma.geofence.findUnique({ where: { id } });
  }

  async create(data: any) {
    return prisma.geofence.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.geofence.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.geofence.delete({ where: { id } });
  }

  async getAlerts(params: { vehicleId?: string; resolved?: boolean; limit?: number }) {
    const where: any = {};
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    if (params.resolved !== undefined) where.resolved = params.resolved;

    return prisma.geofenceAlert.findMany({
      where,
      include: { geofence: true, vehicle: true },
      orderBy: { timestamp: 'desc' },
      take: params.limit ?? 100,
    });
  }
}
