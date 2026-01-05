import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { AlertsController } from './alerts.controller';

const router: ExpressRouter = Router();
const controller = new AlertsController();

router.use(authenticate);
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.patch('/:id/resolve', controller.resolve.bind(controller));
router.post('/:id/resolve', controller.resolve.bind(controller));
router.patch('/:id/unresolve', controller.unresolve.bind(controller));
router.post('/:id/unresolve', controller.unresolve.bind(controller));

export default router;
