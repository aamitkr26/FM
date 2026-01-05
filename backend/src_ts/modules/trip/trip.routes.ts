import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { TripController } from './trip.controller';

const router: ExpressRouter = Router();
const controller = new TripController();

router.use(authenticate);
router.get('/', controller.getAll.bind(controller));
router.get('/vehicle/:vehicleId', controller.getByVehicle.bind(controller));
router.get('/:id', controller.getById.bind(controller));

export default router;
