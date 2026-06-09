import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { chatLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

router.post('/messages', chatLimiter, ChatController.sendMessage);
router.get('/history', ChatController.getHistory);

export default router;
