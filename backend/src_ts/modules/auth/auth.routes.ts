import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { AuthController } from './auth.controller';

const router: ExpressRouter = Router();
const controller = new AuthController();

router.post('/login', controller.login.bind(controller));
router.post('/register', controller.register.bind(controller));
router.get('/me', authenticate, controller.me.bind(controller));
router.post('/change-password', authenticate, controller.changePassword.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));

export default router;
