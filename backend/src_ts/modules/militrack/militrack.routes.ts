import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { MilitrackController } from './militrack.controller';

const router: ExpressRouter = Router();
const controller = new MilitrackController();

router.use(authenticate);

router.get('/device-info', controller.getDeviceInfo.bind(controller));
router.get('/devices', controller.getDevices.bind(controller));

export default router;
