import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest, validationSchemas } from '../middleware/validation.middleware';
import { loginLimiter, registerLimiter } from '../middleware/rateLimit.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/users/register
 * Register a new user
 */
router.post(
  '/register',
  registerLimiter,
  validateRequest(validationSchemas.register),
  AuthController.register
);

/**
 * POST /api/users/login
 * Login a user
 */
router.post(
  '/login',
  loginLimiter,
  validateRequest(validationSchemas.login),
  AuthController.login
);

/**
 * POST /api/users/logout
 * Logout a user
 */
router.post(
  '/logout',
  authMiddleware,
  AuthController.logout
);

export default router;
