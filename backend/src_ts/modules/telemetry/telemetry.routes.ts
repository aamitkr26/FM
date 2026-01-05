import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { telemetryLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validator';
import { TelemetryController } from './telemetry.controller';
import { telemetryInputSchema, telemetryPhoneInputSchema, getTelemetrySchema } from './telemetry.types';

const router: ExpressRouter = Router();
const controller = new TelemetryController();

router.post('/', telemetryLimiter, authenticate, validate(telemetryInputSchema), controller.ingest.bind(controller));
router.post('/phone', telemetryLimiter, authenticate, validate(telemetryPhoneInputSchema), controller.ingestPhone.bind(controller));
router.get('/latest/all', authenticate, controller.getAllLatestTelemetry.bind(controller));

// Legacy aliases used by older clients
router.get('/vehicle/:vehicleId', authenticate, validate(getTelemetrySchema), controller.getTelemetryByVehicle.bind(controller));
router.get('/vehicle/:vehicleId/latest', authenticate, controller.getLatestTelemetry.bind(controller));

router.get('/:vehicleId/latest', authenticate, controller.getLatestTelemetry.bind(controller));
router.get('/:vehicleId', authenticate, validate(getTelemetrySchema), controller.getTelemetryByVehicle.bind(controller));

export default router;
