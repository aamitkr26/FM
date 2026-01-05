import { prisma } from '../../config/database';

export class DashboardService {
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

    const [unresolved, critical, today, activeTrips] = await Promise.all([
      prisma.alert.count({ where: { resolved: false } }),
      prisma.alert.count({ where: { resolved: false, severity: 'critical' } }),
      prisma.alert.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.trip.count({ where: { status: 'active' } }),
    ]);

    return {
      fleet: { total: vehicles.length, moving, stopped, idle, offline },
      alerts: { unresolved, critical, today },
      trips: { active: activeTrips },
    };
  }

  async getRecentAlerts(limit: number = 10) {
    const alerts = await prisma.alert.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
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

  async getFuelStats(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const fuelEvents = await prisma.fuelEvent.findMany({
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        eventType: true,
        delta: true,
        severity: true,
        timestamp: true,
      },
    });

    type FuelEventItem = (typeof fuelEvents)[number];

    const thefts = fuelEvents.filter((e: FuelEventItem) => e.eventType === 'THEFT');
    const refills = fuelEvents.filter((e: FuelEventItem) => e.eventType === 'REFILL');
    const losses = fuelEvents.filter((e: FuelEventItem) => e.eventType === 'LOSS');

    const totalTheft = thefts.reduce(
      (sum: number, e: FuelEventItem) => sum + (e.delta ? Math.abs(e.delta) : 0),
      0,
    );
    const totalRefill = refills.reduce((sum: number, e: FuelEventItem) => sum + (e.delta || 0), 0);
    const totalLoss = losses.reduce(
      (sum: number, e: FuelEventItem) => sum + (e.delta ? Math.abs(e.delta) : 0),
      0,
    );

    return {
      period: `${days} days`,
      thefts: {
        count: thefts.length,
        totalLiters: totalTheft,
      },
      refills: {
        count: refills.length,
        totalLiters: totalRefill,
      },
      losses: {
        count: losses.length,
        totalLiters: totalLoss,
      },
    };
  }

  async getTripStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trips = await prisma.trip.findMany({
      where: {
        startTime: {
          gte: startDate,
        },
        status: 'completed',
      },
      select: {
        distanceKm: true,
        fuelConsumed: true,
      },
    });

    type TripItem = (typeof trips)[number];

    const totalDistance = trips.reduce((sum: number, t: TripItem) => sum + (t.distanceKm || 0), 0);
    const totalFuel = trips.reduce((sum: number, t: TripItem) => sum + (t.fuelConsumed || 0), 0);
    const avgMileage = totalFuel > 0 ? totalDistance / totalFuel : 0;

    return {
      period: `${days} days`,
      totalTrips: trips.length,
      totalDistance,
      totalFuel,
      avgMileage,
    };
  }

  async getLive() {
    const now = new Date();
    const offlineThreshold = new Date(now.getTime() - 30 * 60 * 1000);

    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: 'active',
        lastSeen: {
          gte: offlineThreshold,
        },
      },
      select: {
        id: true,
        imei: true,
        registrationNo: true,
        make: true,
        model: true,
        year: true,
        vin: true,
        fuelCapacity: true,
        lastLat: true,
        lastLng: true,
        lastSeen: true,
        lastSpeed: true,
        lastIgnition: true,
        gpsOdometer: true,
      },
      orderBy: { registrationNo: 'asc' },
    });

    return vehicles;
  }
}
