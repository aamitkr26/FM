import { Router, type Router as ExpressRouter } from 'express';
import { DashboardController } from './dashboard.controller';

const router: ExpressRouter = Router();
const dashboardController = new DashboardController();

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
