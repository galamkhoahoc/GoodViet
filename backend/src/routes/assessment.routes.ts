import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post('/start', AssessmentController.startAssessment);
router.post('/:id/recordings', AssessmentController.addRecording);
router.post('/:id/complete-phase', AssessmentController.completePhase);
router.get('/:id/status', AssessmentController.getStatus);
router.get('/result', AssessmentController.getResult);

export default router;
