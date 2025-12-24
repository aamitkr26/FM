import { Router, type Router as ExpressRouter } from 'express';
import { AlertsController } from './alerts.controller';

const router: ExpressRouter = Router();
const alertsController = new AlertsController();

// Get all alerts
router.get('/', alertsController.getAll.bind(alertsController));

// Get alert by ID
router.get('/:id', alertsController.getById.bind(alertsController));

// Resolve alert
router.patch('/:id/resolve', alertsController.resolve.bind(alertsController));

// Unresolve alert
router.patch('/:id/unresolve', alertsController.unresolve.bind(alertsController));

export default router;
