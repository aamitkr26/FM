import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { FuelController } from './fuel.controller';

const router: ExpressRouter = Router();
const controller = new FuelController();

router.use(authenticate);

router.get('/events', controller.getEvents.bind(controller));
router.get('/theft', controller.getTheft.bind(controller));
router.get('/statistics', controller.getStatistics.bind(controller));
router.get('/vehicle/:vehicleId', controller.getByVehicle.bind(controller));

export default router;
