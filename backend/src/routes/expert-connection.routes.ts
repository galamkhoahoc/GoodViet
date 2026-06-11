import { Router } from 'express';
import { ExpertController } from '../controllers/expert.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// Expert connection routes (mounted at /api/expert-connections)
router.post('/', ExpertController.requestConnection);
router.get('/', ExpertController.getConnections);

export default router;
