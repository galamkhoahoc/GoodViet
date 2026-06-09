import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest, validationSchemas } from '../middleware/validation.middleware';

const router = Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 * Requires authentication
 */
router.get(
  '/profile',
  authMiddleware,
  UserController.getProfile
);

/**
 * PATCH /api/users/profile
 * Update current user's profile
 * Requires authentication
 */
router.patch(
  '/profile',
  authMiddleware,
  validateRequest(validationSchemas.updateProfile),
  UserController.updateProfile
);

export default router;
