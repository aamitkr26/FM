import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { VehiclesController } from './vehicles.controller';

const router: ExpressRouter = Router();
const controller = new VehiclesController();

router.use(authenticate);

router.get('/', controller.getAll.bind(controller));
router.get('/statistics', controller.getStatistics.bind(controller));
router.get('/positions', controller.getPositions.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.patch('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
