import { Router } from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/index.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, handleValidationErrors, register);
router.post('/login', authLimiter, loginValidator, handleValidationErrors, login);
router.post('/logout', protect, logout);

export default router;
