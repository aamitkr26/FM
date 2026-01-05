import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { DashboardController } from './dashboard.controller';

const router: ExpressRouter = Router();
const controller = new DashboardController();

router.use(authenticate);
router.get('/statistics', controller.statistics.bind(controller));
router.get('/alerts', controller.alerts.bind(controller));
router.get('/live', controller.live.bind(controller));
router.get('/fuel-stats', controller.fuelStats.bind(controller));
router.get('/trip-stats', controller.tripStats.bind(controller));

export default router;
