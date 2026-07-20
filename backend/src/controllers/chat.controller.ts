import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ChatMessage } from '../models/ChatMessage';
import { ChatSession } from '../models/ChatSession';
import { AppError } from '../middleware/error.middleware';
import { runWithRequestSessionWrite } from '../middleware/auth.middleware';
import { aiService } from '../services/ai.service';
import { normalizeVietnamese, normalizeHistory } from '../utils/vietnamese.utils';
import validator from 'validator';

/**
 * Chat controller
 */
export class ChatController {
  /**
   * GET /api/chat/history
   * Get chat history for user
   */
  static async getHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const limit = parseInt(req.query.limit as string) || 50;
      const before = req.query.before as string;
      const sessionId = req.query.sessionId as string;

      // Validate limit
      const actualLimit = Math.min(limit, 100);

      // Build query
      const query: any = { userId };
      if (sessionId) {
        query.sessionId = sessionId;
      } else {
        // If no sessionId is provided, we might want to return messages without a session,
        // or just all messages. For now, filter by exactly no session or all if not specified.
        // Actually, to support legacy, if no sessionId, we could return all or those without one.
        // Let's assume if sessionId is provided, we filter by it. If not, we return messages without a sessionId (legacy).
        query.sessionId = { $exists: false };
      }

      if (before) {
        query.timestamp = { $lt: new Date(before) };
      }

      const messages = await ChatMessage.find(query)
        .sort({ timestamp: -1 })
        .limit(actualLimit + 1); // Get one extra to check if there are more

      const hasMore = messages.length > actualLimit;
      const actualMessages = hasMore ? messages.slice(0, actualLimit) : messages;

      res.status(200).json({
        success: true,
        messages: actualMessages,
        hasMore,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/chat/messages
   * Send a message and get bot response
   */
  static async sendMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      let { content, sessionId } = req.body;

      if (!content || content.trim() === '') {
        throw new AppError(400, 'Nội dung tin nhắn không được để trống');
      }

      // THÊM sanitization chống XSS
      content = validator.escape(content.trim());
      
      // Normalize Vietnamese text
      // Requirements: 9.2, 9.6, 9.7
      content = normalizeVietnamese(content);

      if (content.length > 2000) {
        throw new AppError(400, 'Tin nhắn quá dài (tối đa 2000 ký tự)');
      }

      // For session messages, the ownership decision, session write, and
      // message create share one transaction. Updating the session document
      // also creates a write conflict with a concurrent session deletion.
      const userMessage = await runWithRequestSessionWrite(req, async () => {
        if (sessionId) {
          const ownedSession = await ChatSession.findOneAndUpdate(
            { _id: sessionId, userId },
            {
              $set: { lastMessageAt: new Date() },
              $inc: { mutationVersion: 1 },
            },
            { new: true }
          );
          if (!ownedSession) {
            throw new AppError(404, 'Session not found');
          }
        }

        const createdMessage = await ChatMessage.create({
          userId: new mongoose.Types.ObjectId(userId),
          sessionId: sessionId ? new mongoose.Types.ObjectId(sessionId) : undefined,
          senderType: 'user',
          content,
        });

        return createdMessage;
      }, { transactionForStandard: Boolean(sessionId) });

      // Fetch recent history for context (last 10 messages)
      // Requirements: 11.1, 11.2, 11.3, 11.4, 11.7
      const historyQuery: any = { userId };
      if (sessionId) historyQuery.sessionId = sessionId;
      else historyQuery.sessionId = { $exists: false };

      const recentHistory = await ChatMessage.find(historyQuery)
        .sort({ timestamp: -1 })
        .skip(1) // Skip the message we just inserted
        .limit(10) // Limit to 10 most recent messages
        .lean(); // Add lean() for better performance
      
      // Reverse to chronological order and format for AI service
      const formattedHistory = recentHistory
        .reverse()
        .map(msg => ({
          role: msg.senderType === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // Normalize history content
      // Requirements: 9.2, 9.6, 9.7
      const normalizedHistory = normalizeHistory(formattedHistory);

      // Generate response from AI service (Gemma4, LocalEngine, or Gemini)
      const botResponseContent = await aiService.generateChatResponse(content, normalizedHistory);

      // A reset may happen while the AI call is running, so acquire a fresh
      // write transaction for the bot response rather than reusing the first one.
      const botMessage = await runWithRequestSessionWrite(req, async () => {
        if (sessionId) {
          const ownedSession = await ChatSession.findOneAndUpdate(
            { _id: sessionId, userId },
            {
              $set: { lastMessageAt: new Date() },
              $inc: { mutationVersion: 1 },
            },
            { new: true }
          );
          if (!ownedSession) {
            throw new AppError(404, 'Session not found');
          }
        }

        return ChatMessage.create({
          userId: new mongoose.Types.ObjectId(userId),
          sessionId: sessionId ? new mongoose.Types.ObjectId(sessionId) : undefined,
          senderType: 'bot',
          content: botResponseContent,
        });
      }, { transactionForStandard: Boolean(sessionId) });

      res.status(201).json({
        success: true,
        userMessage,
        botMessage,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chat/sessions
   * Get all chat sessions for user
   */
  static async getSessions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const sessions = await ChatSession.find({ userId })
        .sort({ lastMessageAt: -1 })
        .lean();

      // Check if user has any legacy messages (without a sessionId)
      const hasLegacyMessages = await ChatMessage.exists({ userId, sessionId: { $exists: false } });

      res.status(200).json({
        success: true,
        sessions,
        hasLegacyMessages: !!hasLegacyMessages
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/chat/sessions
   * Create a new chat session
   */
  static async createSession(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const { title } = req.body;

      const session = await runWithRequestSessionWrite(req, () => ChatSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        title: title || 'Cuộc trò chuyện mới'
      }));

      res.status(201).json({
        success: true,
        session
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/chat/sessions/:id
   * Delete a chat session and its messages
   */
  static async deleteSession(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const sessionId = req.params.id;

      await runWithRequestSessionWrite(req, async () => {
        const deletedSession = await ChatSession.findOneAndDelete({
          _id: sessionId,
          userId,
        });
        if (!deletedSession) {
          throw new AppError(404, 'Session not found');
        }

        await ChatMessage.deleteMany({ sessionId, userId });
      }, { transactionForStandard: true });

      res.status(200).json({
        success: true,
        message: 'Session deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
