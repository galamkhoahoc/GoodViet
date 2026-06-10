import { Router } from 'express';
import { ExpertController } from '../controllers/expert.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

router.get('/', ExpertController.getExperts);
router.post('/connections', ExpertController.requestConnection);
router.get('/connections', ExpertController.getConnections);
router.post('/sessions', ExpertController.bookSession);
router.get('/sessions', ExpertController.getSessions);
router.patch('/sessions/:id/rate', ExpertController.rateSession);

export default router;
