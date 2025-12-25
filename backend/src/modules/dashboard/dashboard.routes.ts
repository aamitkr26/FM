import { Router, type Router as ExpressRouter } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';

const router: ExpressRouter = Router();
const dashboardController = new DashboardController();

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

// Get fleet statistics
router.get('/statistics', dashboardController.getStatistics.bind(dashboardController));

// Get recent alerts
router.get('/alerts', dashboardController.getRecentAlerts.bind(dashboardController));

// Get live vehicles
router.get('/live', dashboardController.getLiveVehicles.bind(dashboardController));

// Get fuel statistics
router.get('/fuel-stats', dashboardController.getFuelStatistics.bind(dashboardController));

// Get trip statistics
router.get('/trip-stats', dashboardController.getTripStatistics.bind(dashboardController));

export default router;
