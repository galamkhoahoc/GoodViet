import { Router } from 'express';
import { ExpertController } from '../controllers/expert.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// Expert session routes (mounted at /api/expert-sessions)
router.post('/', ExpertController.bookSession);
router.get('/', ExpertController.getSessions);
router.patch('/:id/rate', ExpertController.rateSession);

export default router;
