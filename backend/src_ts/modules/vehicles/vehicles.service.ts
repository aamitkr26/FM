import { prisma } from '../../config/database';

export class VehiclesService {
  async getAll(options: { status?: string; limit?: number; offset?: number }) {
    const where: any = {};
    if (options.status) where.status = options.status;

    return prisma.vehicle.findMany({
      where,
      orderBy: { registrationNo: 'asc' },
      take: options.limit,
      skip: options.offset,
    });
  }

  async getById(id: string) {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  async getStatistics() {
    const now = new Date();
    const offlineThreshold = new Date(now.getTime() - 30 * 60 * 1000);

    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        lastSeen: true,
        lastSpeed: true,
        lastIgnition: true,
      },
    });

    let moving = 0;
    let stopped = 0;
    let idle = 0;
    let offline = 0;

    for (const v of vehicles) {
      const lastSeen = v.lastSeen;
      const lastSpeed = v.lastSpeed ?? 0;
      const lastIgnition = v.lastIgnition ?? false;

      if (!lastSeen || lastSeen < offlineThreshold) offline++;
      else if (lastSpeed > 5) moving++;
      else if (lastIgnition && lastSpeed > 0) idle++;
      else stopped++;
    }

    return { total: vehicles.length, moving, stopped, idle, offline };
  }

  async getPositions() {
    return prisma.vehicle.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        imei: true,
        registrationNo: true,
        lastLat: true,
        lastLng: true,
        lastSeen: true,
        lastSpeed: true,
        lastIgnition: true,
      },
      orderBy: { registrationNo: 'asc' },
    });
  }

  async create(data: any) {
    return prisma.vehicle.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.vehicle.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.vehicle.delete({ where: { id } });
  }
}
