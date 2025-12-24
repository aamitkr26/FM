import { Router, type Router as ExpressRouter } from 'express';
import { AuthController } from './auth.controller';

const router: ExpressRouter = Router();
const authController = new AuthController();

// Login endpoint
router.post('/login', authController.login.bind(authController));

// Refresh token endpoint
router.post('/refresh', authController.refresh.bind(authController));

export default router;
