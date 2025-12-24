import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { haversineKm } from '../../utils/haversine';
import { AlertsService } from '../alerts/alerts.service';

interface GeofenceCheckResult {
  inside: boolean;
  geofence: any;
  distance?: number;
}

export class GeofenceEngine {
  private alertService: AlertsService;
  private vehicleGeofenceStates: Map<
    string,
    { geofenceId: string; inside: boolean; entryTime?: Date }
  >;

  constructor() {
    this.alertService = new AlertsService();
    this.vehicleGeofenceStates = new Map();
  }

  /**
   * Check if vehicle is inside any geofences and handle entry/exit events
   */
  async checkGeofences(
    vehicleId: string,
    lat: number,
    lng: number,
    timestamp: Date
  ): Promise<void> {
    try {
      // Get all active geofences
      const geofences = await prisma.geofence.findMany();

      for (const geofence of geofences) {
        const checkResult = this.isInsideGeofence(geofence, lat, lng);
        const stateKey = `${vehicleId}-${geofence.id}`;
        const previousState = this.vehicleGeofenceStates.get(stateKey);

        // ENTRY: Vehicle entered geofence
        if (checkResult.inside && (!previousState || !previousState.inside)) {
          logger.info(
            `Vehicle ${vehicleId} ENTERED geofence: ${geofence.name}`
          );

          // Update state
          this.vehicleGeofenceStates.set(stateKey, {
            geofenceId: geofence.id,
            inside: true,
            entryTime: timestamp,
          });

          // Create geofence alert
          await prisma.geofenceAlert.create({
            data: {
              geofenceId: geofence.id,
              vehicleId,
              alertType: 'ENTRY',
              message: `Entered geofence ${geofence.name}`,
              latitude: lat,
              longitude: lng,
              timestamp,
            },
          });

          // Create alert
          await this.alertService.createAlert({
            vehicleId,
            type: 'GEOFENCE_ENTRY',
            severity: 'info',
            title: `Geofence Entry: ${geofence.name}`,
            message: `Vehicle entered geofence "${geofence.name}"`,
            metadata: {
              geofenceId: geofence.id,
              geofenceName: geofence.name,
              geofenceType: geofence.type,
              timestamp,
            },
          });
        }

        // EXIT: Vehicle exited geofence
        if (!checkResult.inside && previousState && previousState.inside) {
          logger.info(`Vehicle ${vehicleId} EXITED geofence: ${geofence.name}`);

          const dwellTime = previousState.entryTime
            ? (timestamp.getTime() - previousState.entryTime.getTime()) / 1000 / 60
            : 0;

          // Update state
          this.vehicleGeofenceStates.set(stateKey, {
            geofenceId: geofence.id,
            inside: false,
          });

          // Create geofence alert
          await prisma.geofenceAlert.create({
            data: {
              geofenceId: geofence.id,
              vehicleId,
              alertType: 'EXIT',
              message: `Exited geofence ${geofence.name}`,
              latitude: lat,
              longitude: lng,
              timestamp,
            },
          });

          // Create alert
          await this.alertService.createAlert({
            vehicleId,
            type: 'GEOFENCE_EXIT',
            severity: 'info',
            title: `Geofence Exit: ${geofence.name}`,
            message: `Vehicle exited geofence "${geofence.name}" after ${dwellTime.toFixed(0)} minutes`,
            metadata: {
              geofenceId: geofence.id,
              geofenceName: geofence.name,
              geofenceType: geofence.type,
              dwellTime,
              timestamp,
            },
          });
        }

        // DWELL: Vehicle stayed too long in geofence
        if (
          checkResult.inside &&
          previousState &&
          previousState.inside &&
          previousState.entryTime
        ) {
          const dwellTime =
            (timestamp.getTime() - previousState.entryTime.getTime()) / 1000 / 60;

          // Check if dwell time exceeds threshold (30 minutes)
          if (dwellTime > 30 && dwellTime < 31) {
            // Only alert once
            logger.warn(
              `Vehicle ${vehicleId} dwelling in geofence: ${geofence.name} for ${dwellTime.toFixed(0)} minutes`
            );

            await this.alertService.createAlert({
              vehicleId,
              type: 'GEOFENCE_DWELL',
              severity: 'warning',
              title: `Excessive Dwell: ${geofence.name}`,
              message: `Vehicle has been in geofence "${geofence.name}" for over 30 minutes`,
              metadata: {
                geofenceId: geofence.id,
                geofenceName: geofence.name,
                dwellTime,
                timestamp,
              },
            });
          }
        }
      }
    } catch (error) {
      logger.error(`Geofence check error: ${error}`);
    }
  }

  /**
   * Check if a point is inside a geofence
   */
  private isInsideGeofence(
    geofence: any,
    lat: number,
    lng: number
  ): GeofenceCheckResult {
    if (geofence.type === 'circle') {
      // Circle geofence: check distance from center
      const distance = haversineKm(
        geofence.centerLat,
        geofence.centerLng,
        lat,
        lng
      );

      const distanceMeters = distance * 1000;
      const inside = distanceMeters <= geofence.radius;

      return {
        inside,
        geofence,
        distance: distanceMeters,
      };
    } else if (geofence.type === 'polygon') {
      // Polygon geofence: ray casting algorithm
      const polygon = geofence.polygon as { lat: number; lng: number }[];

      if (!polygon || polygon.length < 3) {
        logger.warn(`Invalid polygon for geofence ${geofence.id}`);
        return { inside: false, geofence };
      }

      const inside = this.isPointInPolygon(lat, lng, polygon);

      return { inside, geofence };
    }

    return { inside: false, geofence };
  }

  /**
   * Ray casting algorithm to check if point is inside polygon
   */
  private isPointInPolygon(
    lat: number,
    lng: number,
    polygon: { lat: number; lng: number }[]
  ): boolean {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng;
      const yi = polygon[i].lat;
      const xj = polygon[j].lng;
      const yj = polygon[j].lat;

      const intersect =
        yi > lat !== yj > lat &&
        lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }
}
