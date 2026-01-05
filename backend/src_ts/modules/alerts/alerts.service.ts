import { prisma } from '../../config/database';

export class AlertsService {
  async getAll(params: { resolved?: boolean; limit?: number; offset?: number; severity?: string }) {
    const where: any = {};
    if (params.resolved !== undefined) where.resolved = params.resolved;
    if (params.severity) where.severity = params.severity;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit,
      skip: params.offset,
      include: {
        vehicle: {
          select: {
            id: true,
            imei: true,
            registrationNo: true,
          },
        },
      },
    });

    return alerts;
  }

  async getById(id: string) {
    return prisma.alert.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            imei: true,
            registrationNo: true,
          },
        },
      },
    });
  }

  async resolve(id: string, resolvedBy: string) {
    return prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            imei: true,
            registrationNo: true,
          },
        },
      },
    });
  }

  async unresolve(id: string) {
    return prisma.alert.update({
      where: { id },
      data: {
        resolved: false,
        resolvedAt: null,
        resolvedBy: null,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            imei: true,
            registrationNo: true,
          },
        },
      },
    });
  }
}
