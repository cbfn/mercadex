import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import { authenticate } from './auth.middleware';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;
