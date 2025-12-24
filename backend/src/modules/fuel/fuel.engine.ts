import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { THRESHOLDS, FUEL_EVENT_TYPES, FUEL_PATTERNS, FUEL_SEVERITY } from '../../utils/constants';
import { TelemetryPayload } from '../telemetry/telemetry.types';
import { FuelAnalysis } from './fuel.types';
import { AlertsService } from '../alerts/alerts.service';

export class FuelEngine {
  private alertService: AlertsService;

  constructor() {
    this.alertService = new AlertsService();
  }

  /**
   * Main fuel analysis function - detects theft, manipulation, and normal consumption
   */
  async analyzeFuel(
    vehicle: any,
    lastTelemetry: any,
    currentPayload: TelemetryPayload,
    distanceKm: number
  ): Promise<void> {
    try {
      // Extract fuel levels
      const currentFuel = this.extractFuelLevel(currentPayload);
      const previousFuel = await this.getPreviousFuelLevel(vehicle.id, lastTelemetry);

      // If we don't have both fuel levels, we can't analyze
      if (currentFuel === null || previousFuel === null) {
        logger.debug(`Fuel analysis skipped: missing fuel data for ${vehicle.registrationNo || vehicle.imei}`);
        return;
      }

      // Calculate fuel delta
      const delta = currentFuel - previousFuel;

      // Determine engine state
      const engineState: 'ON' | 'OFF' = currentPayload.ignition ? 'ON' : 'OFF';

      // Perform pattern detection
      const analysis = this.detectFuelPattern(
        previousFuel,
        currentFuel,
        delta,
        distanceKm,
        engineState,
        lastTelemetry,
        currentPayload
      );

      // Store fuel event in database
      await prisma.fuelEvent.create({
        data: {
          vehicleId: vehicle.id,
          timestamp: currentPayload.timestamp,
          eventType: analysis.eventType,
          previousLevel: previousFuel,
          currentLevel: currentFuel,
          delta,
          distanceKm,
          engineState,
          pattern: analysis.pattern || 'NORMAL',
          severity: analysis.severity,
          confidence: analysis.confidence,
          evidence: analysis.evidence,
        },
      });

      // Generate alert if critical or high suspicion
      if (analysis.severity === 'red' || (analysis.severity === 'yellow' && analysis.confidence > 70)) {
        await this.generateFuelAlert(vehicle, analysis);
      }

      logger.info(
        `Fuel analysis: ${vehicle.registrationNo || vehicle.imei} - ${analysis.eventType} - ${analysis.severity} - ${analysis.confidence}% confidence`
      );
    } catch (error) {
      logger.error(`Fuel analysis error: ${error}`);
    }
  }

  /**
   * Detect fuel theft/manipulation patterns
   */
  private detectFuelPattern(
    previousLevel: number,
    currentLevel: number,
    delta: number,
    distanceKm: number,
    engineState: 'ON' | 'OFF',
    lastTelemetry: any,
    currentPayload: TelemetryPayload
  ): FuelAnalysis {
    const absDrop = Math.abs(Math.min(0, delta));
    const absIncrease = Math.max(0, delta);
    const evidence: string[] = [];

    // Calculate time difference (in minutes)
    const timeDiff = lastTelemetry
      ? (new Date(currentPayload.timestamp).getTime() - new Date(lastTelemetry.timestamp).getTime()) / 60000
      : 0;

    // RULE 1: Engine OFF + Large Fuel Drop = CRITICAL THEFT
    if (
      engineState === 'OFF' &&
      absDrop >= THRESHOLDS.CRITICAL_FUEL_DROP &&
      timeDiff < THRESHOLDS.FUEL_DROP_TIME_WINDOW
    ) {
      evidence.push(`Engine OFF with ${absDrop.toFixed(1)}L drop in ${timeDiff.toFixed(0)} minutes`);
      evidence.push(`Vehicle traveled only ${distanceKm.toFixed(2)}km`);
      evidence.push('CRITICAL: Likely manual fuel theft while parked');

      return {
        eventType: FUEL_EVENT_TYPES.THEFT,
        pattern: FUEL_PATTERNS.ENGINE_OFF_DROP,
        severity: FUEL_SEVERITY.RED,
        confidence: 95,
        evidence,
        previousLevel,
        currentLevel,
        delta,
        distanceKm,
        engineState,
      };
    }

    // RULE 2: Rapid Drop While Moving = HIGH SUSPICION
    if (
      engineState === 'ON' &&
      absDrop >= THRESHOLDS.RAPID_FUEL_DROP &&
      timeDiff < 5 &&
      currentPayload.speed > 10
    ) {
      evidence.push(`Rapid ${absDrop.toFixed(1)}L drop in ${timeDiff.toFixed(0)} minutes while moving`);
      evidence.push(`Speed: ${currentPayload.speed.toFixed(0)} km/h`);
      evidence.push('SUSPICIOUS: Possible leak or sensor malfunction');

      return {
        eventType: FUEL_EVENT_TYPES.LOSS,
        pattern: FUEL_PATTERNS.RAPID_DROP,
        severity: FUEL_SEVERITY.YELLOW,
        confidence: 75,
        evidence,
        previousLevel,
        currentLevel,
        delta,
        distanceKm,
        engineState,
      };
    }

    // RULE 3: Refill Without Movement = MANIPULATION
    if (
      absIncrease >= 10 &&
      distanceKm < THRESHOLDS.REFILL_DISTANCE_THRESHOLD &&
      timeDiff < 30
    ) {
      evidence.push(`Fuel increase of ${absIncrease.toFixed(1)}L with minimal movement (${distanceKm.toFixed(2)}km)`);
      evidence.push('SUSPICIOUS: Possible manual refill or sensor manipulation');

      return {
        eventType: FUEL_EVENT_TYPES.MANIPULATION,
        pattern: FUEL_PATTERNS.REFILL_NO_MOVEMENT,
        severity: FUEL_SEVERITY.YELLOW,
        confidence: 80,
        evidence,
        previousLevel,
        currentLevel,
        delta,
        distanceKm,
        engineState,
      };
    }

    // RULE 4: Normal Refill Detection
    if (absIncrease >= 20 && distanceKm > THRESHOLDS.REFILL_DISTANCE_THRESHOLD) {
      evidence.push(`Normal refill: ${absIncrease.toFixed(1)}L added`);
      evidence.push(`Distance: ${distanceKm.toFixed(2)}km`);

      return {
        eventType: FUEL_EVENT_TYPES.REFILL,
        pattern: null,
        severity: FUEL_SEVERITY.GREEN,
        confidence: 90,
        evidence,
        previousLevel,
        currentLevel,
        delta,
        distanceKm,
        engineState,
      };
    }

    // RULE 5: Gradual Loss (Monitor)
    if (absDrop > 2 && absDrop < THRESHOLDS.CRITICAL_FUEL_DROP && distanceKm < 5) {
      evidence.push(`Gradual loss: ${absDrop.toFixed(1)}L over ${distanceKm.toFixed(2)}km`);
      evidence.push('Monitoring for pattern');

      return {
        eventType: FUEL_EVENT_TYPES.LOSS,
        pattern: FUEL_PATTERNS.GRADUAL_LOSS,
        severity: FUEL_SEVERITY.YELLOW,
        confidence: 60,
        evidence,
        previousLevel,
        currentLevel,
        delta,
        distanceKm,
        engineState,
      };
    }

    // RULE 6: Normal Consumption
    evidence.push(`Normal consumption: ${Math.abs(delta).toFixed(1)}L over ${distanceKm.toFixed(2)}km`);

    return {
      eventType: FUEL_EVENT_TYPES.NORMAL,
      pattern: null,
      severity: FUEL_SEVERITY.GREEN,
      confidence: 100,
      evidence,
      previousLevel,
      currentLevel,
      delta,
      distanceKm,
      engineState,
    };
  }

  /**
   * Extract fuel level from telemetry payload
   */
  private extractFuelLevel(payload: TelemetryPayload): number | null {
    if (payload.fuelLevel != null) {
      return Number(payload.fuelLevel);
    }

    if (payload.raw?.attributes?.fuelLevel != null) {
      return Number(payload.raw.attributes.fuelLevel);
    }

    if (payload.raw?.charge != null) {
      return Number(payload.raw.charge);
    }

    return null;
  }

  /**
   * Get previous fuel level from last telemetry or fuel log
   */
  private async getPreviousFuelLevel(vehicleId: string, lastTelemetry: any): Promise<number | null> {
    // Try to get from last fuel event
    const lastFuelEvent = await prisma.fuelEvent.findFirst({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
    });

    if (lastFuelEvent) {
      return lastFuelEvent.currentLevel;
    }

    // Fallback to last telemetry
    if (lastTelemetry) {
      return this.extractFuelLevel(lastTelemetry);
    }

    return null;
  }

  /**
   * Generate alert for fuel theft/manipulation
   */
  private async generateFuelAlert(vehicle: any, analysis: FuelAnalysis): Promise<void> {
    const title = analysis.eventType === FUEL_EVENT_TYPES.THEFT
      ? 'FUEL THEFT DETECTED'
      : 'SUSPICIOUS FUEL EVENT';

    const message = `${vehicle.registrationNo || vehicle.imei}: ${analysis.evidence.join('. ')}`;

    await this.alertService.createAlert({
      vehicleId: vehicle.id,
      type: 'FUEL_THEFT',
      severity: analysis.severity === 'red' ? 'critical' : 'warning',
      title,
      message,
      metadata: {
        pattern: analysis.pattern,
        confidence: analysis.confidence,
        delta: analysis.delta,
        previousLevel: analysis.previousLevel,
        currentLevel: analysis.currentLevel,
        engineState: analysis.engineState,
      },
    });
  }
}
