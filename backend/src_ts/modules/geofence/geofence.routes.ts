import { Router, type Router as ExpressRouter } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { GeofenceController } from './geofence.controller';

const router: ExpressRouter = Router();
const controller = new GeofenceController();

router.use(authenticate);

router.get('/', controller.getAll.bind(controller));
router.get('/alerts', controller.getAlerts.bind(controller));
router.get('/alerts/all', controller.getAlerts.bind(controller));
router.get('/:id', controller.getById.bind(controller));

router.post('/', authorize('owner', 'supervisor', 'admin'), controller.create.bind(controller));
router.patch('/:id', authorize('owner', 'supervisor', 'admin'), controller.update.bind(controller));
router.delete('/:id', authorize('owner', 'supervisor', 'admin'), controller.delete.bind(controller));

export default router;
