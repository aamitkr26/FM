import { prisma } from '../../config/database';

export class FuelService {
  async getEvents(params: {
    vehicleId?: string;
    severity?: string;
    eventType?: string;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};

    if (params.vehicleId) where.vehicleId = params.vehicleId;
    if (params.severity) where.severity = params.severity;
    if (params.eventType) where.eventType = params.eventType;

    if (params.startDate || params.endDate) {
      where.timestamp = {};
      if (params.startDate) where.timestamp.gte = new Date(params.startDate);
      if (params.endDate) where.timestamp.lte = new Date(params.endDate);
    }

    return prisma.fuelEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: params.limit ?? 100,
      include: {
        vehicle: {
          select: {
            id: true,
            imei: true,
            registrationNo: true,
            make: true,
            model: true,
          },
        },
      },
    });
  }

  async getTheftEvents(params: { vehicleId?: string; limit?: number }) {
    const where: any = {
      severity: { in: ['red', 'yellow'] },
      eventType: { in: ['THEFT', 'MANIPULATION', 'LOSS'] },
    };

    if (params.vehicleId) where.vehicleId = params.vehicleId;

    return prisma.fuelEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: params.limit ?? 50,
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

  async getStatistics(params: { vehicleId?: string; days?: number }) {
    const days = params.days ?? 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = { timestamp: { gte: startDate } };
    if (params.vehicleId) where.vehicleId = params.vehicleId;

    const events = await prisma.fuelEvent.findMany({ where });
    type FuelEventItem = (typeof events)[number];

    const totalLoss = events
      .filter((e: FuelEventItem) => (e.delta ?? 0) < 0)
      .reduce((sum: number, e: FuelEventItem) => sum + Math.abs(e.delta ?? 0), 0);

    return {
      totalEvents: events.length,
      theftEvents: events.filter((e: FuelEventItem) => e.eventType === 'THEFT').length,
      refillEvents: events.filter((e: FuelEventItem) => e.eventType === 'REFILL').length,
      totalFuelLoss: totalLoss,
      suspiciousEvents: events.filter((e: FuelEventItem) => e.severity === 'red' || e.severity === 'yellow').length,
      averageConsumption: events.length > 0 ? totalLoss / events.length : 0,
    };
  }
}
