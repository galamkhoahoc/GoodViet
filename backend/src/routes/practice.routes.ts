import { Router } from 'express';
import { PracticeController } from '../controllers/practice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

router.get('/pathways', PracticeController.getPathways);
router.post('/start', PracticeController.startPathway);
router.get('/progress', PracticeController.getProgress);
router.get('/day/:week/:day', PracticeController.getDayExercises);
router.post('/checkin', PracticeController.checkin);

export default router;
