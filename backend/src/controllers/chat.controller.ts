import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ChatMessage } from '../models/ChatMessage';
import { AppError } from '../middleware/error.middleware';
import { geminiService } from '../services/gemini.service';
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

      // Validate limit
      const actualLimit = Math.min(limit, 100);

      // Build query
      const query: any = { userId };
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

      let { content } = req.body;

      if (!content || content.trim() === '') {
        throw new AppError(400, 'Nội dung tin nhắn không được để trống');
      }

      // THÊM sanitization chống XSS
      content = validator.escape(content.trim());

      if (content.length > 2000) {
        throw new AppError(400, 'Tin nhắn quá dài (tối đa 2000 ký tự)');
      }

      // Save user message
      const userMessage = await ChatMessage.create({
        userId: new mongoose.Types.ObjectId(userId),
        senderType: 'user',
        content,
      });

      // Fetch recent history for context (last 10 messages)
      const recentHistory = await ChatMessage.find({ userId })
        .sort({ timestamp: -1 })
        .skip(1) // Skip the message we just inserted
        .limit(10);
      
      // Reverse to chronological order for Gemini
      const formattedHistory = recentHistory.reverse();

      // Generate response from Gemini
      const botResponseContent = await geminiService.generateChatResponse(content, formattedHistory);

      // Save bot message
      const botMessage = await ChatMessage.create({
        userId: new mongoose.Types.ObjectId(userId),
        senderType: 'bot',
        content: botResponseContent,
      });

      res.status(201).json({
        success: true,
        userMessage,
        botMessage,
      });
    } catch (error) {
      next(error);
    }
  }
}
