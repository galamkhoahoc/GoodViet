import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { chatLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

router.get('/sessions', ChatController.getSessions);
router.post('/sessions', ChatController.createSession);
router.delete('/sessions/:id', ChatController.deleteSession);

router.post('/messages', chatLimiter, ChatController.sendMessage);
router.post('/evaluate', chatLimiter, ChatController.evaluate);
router.get('/history', ChatController.getHistory);

export default router;
