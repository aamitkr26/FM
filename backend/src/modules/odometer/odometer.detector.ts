import { haversineKm } from '../../utils/haversine';
import { logger } from '../../config/logger';
import { THRESHOLDS } from '../../utils/constants';
import { AlertsService } from '../alerts/alerts.service';

interface OdometerAnalysis {
  suspicious: boolean;
  gpsDistance: number;
  odometerDistance: number;
  deviation: number;
  deviationPercent: number;
  confidence: number;
  evidence: string[];
}

export class OdometerDetector {
  private alertService: AlertsService;

  constructor() {
    this.alertService = new AlertsService();
  }

  /**
   * Analyze odometer readings against GPS distance
   * 
   * DETECTION LOGIC:
   * - Calculate GPS distance using Haversine formula
   * - Compare GPS odometer vs dashboard odometer
   * - Detect rollback, tampering, disconnection
   * 
   * THRESHOLDS:
   * - Deviation > 10% = suspicious
   * - Deviation > 50km = very suspicious
   * - Negative change = rollback (CRITICAL)
   */
  analyzeOdometer(
    vehicleId: string,
    currentTelemetry: {
      lat: number;
      lng: number;
      odometer: number;
      timestamp: Date;
    },
    previousTelemetry: {
      lat: number;
      lng: number;
      odometer: number;
      timestamp: Date;
    },
    dashOdometer: number,
    previousDashOdometer: number
  ): OdometerAnalysis {
    const evidence: string[] = [];
    let suspicious = false;
    let confidence = 0;

    // Calculate GPS distance (from coordinates)
    const gpsDistance = haversineKm(
      previousTelemetry.lat,
      previousTelemetry.lng,
      currentTelemetry.lat,
      currentTelemetry.lng
    );

    // Calculate odometer-reported distance
    const odometerDistance = currentTelemetry.odometer - previousTelemetry.odometer;

    // Calculate dashboard odometer change
    const dashOdometerDelta = dashOdometer - previousDashOdometer;

    // RULE 1: Detect odometer rollback (CRITICAL)
    if (odometerDistance < 0) {
      suspicious = true;
      confidence = 99;
      evidence.push('CRITICAL: Odometer reading decreased (rollback detected)');
      evidence.push(`GPS odometer dropped by ${Math.abs(odometerDistance).toFixed(2)}km`);

      // Create alert
      this.alertService.createAlert({
        vehicleId,
        type: 'ODOMETER_TAMPER',
        severity: 'critical',
        title: 'Odometer Rollback Detected',
        message: `GPS odometer decreased by ${Math.abs(odometerDistance).toFixed(2)}km - possible tampering`,
        metadata: {
          gpsDistance,
          odometerDistance,
          deviation: Math.abs(gpsDistance - odometerDistance),
          confidence,
        },
      }).catch((err: any) => logger.error(`Failed to create odometer alert: ${err}`));

      return {
        suspicious,
        gpsDistance,
        odometerDistance,
        deviation: Math.abs(gpsDistance - odometerDistance),
        deviationPercent: 100,
        confidence,
        evidence,
      };
    }

    // RULE 2: Detect significant deviation between GPS and odometer
    const deviation = Math.abs(gpsDistance - odometerDistance);
    const deviationPercent = gpsDistance > 0 ? (deviation / gpsDistance) * 100 : 0;

    if (
      deviation > THRESHOLDS.ODOMETER_DEVIATION_ABS ||
      deviationPercent > THRESHOLDS.ODOMETER_DEVIATION_PERCENT
    ) {
      suspicious = true;
      confidence = Math.min(50 + deviationPercent * 2, 90);

      evidence.push(`GPS distance: ${gpsDistance.toFixed(2)}km`);
      evidence.push(`Odometer distance: ${odometerDistance.toFixed(2)}km`);
      evidence.push(`Deviation: ${deviation.toFixed(2)}km (${deviationPercent.toFixed(1)}%)`);

      if (odometerDistance < gpsDistance * 0.5) {
        evidence.push('WARNING: Odometer reports less than half of GPS distance');
        evidence.push('Possible odometer disconnection or tampering');
      } else if (odometerDistance > gpsDistance * 2) {
        evidence.push('WARNING: Odometer reports more than double GPS distance');
        evidence.push('Possible GPS signal loss or sensor issue');
      }

      // Create alert for significant deviation
      this.alertService.createAlert({
        vehicleId,
        type: 'ODOMETER_TAMPER',
        severity: 'warning',
        title: 'Odometer Deviation Detected',
        message: `GPS and odometer readings differ by ${deviation.toFixed(2)}km (${deviationPercent.toFixed(1)}%)`,
        metadata: {
          gpsDistance,
          odometerDistance,
          deviation,
          deviationPercent,
          confidence,
        },
      }).catch((err: any) => logger.error(`Failed to create odometer alert: ${err}`));
    }

    // RULE 3: Compare dashboard odometer vs GPS odometer
    if (dashOdometerDelta > 0 && odometerDistance > 0) {
      const dashDeviation = Math.abs(dashOdometerDelta - odometerDistance);
      const dashDeviationPercent =
        odometerDistance > 0 ? (dashDeviation / odometerDistance) * 100 : 0;

      if (dashDeviationPercent > THRESHOLDS.ODOMETER_DEVIATION_PERCENT) {
        evidence.push(`Dashboard odometer delta: ${dashOdometerDelta.toFixed(2)}km`);
        evidence.push(
          `Dashboard vs GPS deviation: ${dashDeviation.toFixed(2)}km (${dashDeviationPercent.toFixed(1)}%)`
        );

        if (!suspicious) {
          suspicious = true;
          confidence = Math.min(40 + dashDeviationPercent, 70);
        }
      }
    }

    // RULE 4: No movement detected but odometer increased
    if (gpsDistance < THRESHOLDS.STATIONARY_DISTANCE && odometerDistance > 1) {
      suspicious = true;
      confidence = 85;
      evidence.push('Vehicle stationary (GPS) but odometer increased');
      evidence.push('Possible manual tampering or sensor malfunction');

      this.alertService.createAlert({
        vehicleId,
        type: 'ODOMETER_TAMPER',
        severity: 'warning',
        title: 'Suspicious Odometer Activity',
        message: `Odometer increased by ${odometerDistance.toFixed(2)}km while vehicle stationary`,
        metadata: {
          gpsDistance,
          odometerDistance,
          confidence,
        },
      }).catch((err: any) => logger.error(`Failed to create odometer alert: ${err}`));
    }

    // RULE 5: Normal operation
    if (!suspicious) {
      evidence.push('Normal odometer operation');
      evidence.push(`GPS distance: ${gpsDistance.toFixed(2)}km`);
      evidence.push(`Odometer distance: ${odometerDistance.toFixed(2)}km`);
      confidence = 100;
    }

    logger.debug(
      `Odometer analysis for vehicle ${vehicleId}: GPS=${gpsDistance.toFixed(2)}km, Odometer=${odometerDistance.toFixed(2)}km, Deviation=${deviation.toFixed(2)}km (${deviationPercent.toFixed(1)}%)`
    );

    return {
      suspicious,
      gpsDistance,
      odometerDistance,
      deviation,
      deviationPercent,
      confidence,
      evidence,
    };
  }
}
