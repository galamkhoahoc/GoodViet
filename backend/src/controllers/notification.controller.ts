import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';
import { AppError } from '../middleware/error.middleware';

/**
 * Notification controller
 */
export class NotificationController {
  /**
   * GET /api/notifications
   * Get current user's notifications
   */
  static async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      const query: any = { userId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);

      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

      res.status(200).json({
        success: true,
        notifications,
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a notification as read
   */
  static async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(400, 'Invalid Notification ID');
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId },
        { $set: { isRead: true } },
        { new: true }
      );

      if (!notification) {
        throw new AppError(404, 'Notification not found');
      }

      res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Utility to create a notification directly
   */
  static async createNotification(
    userId: string | mongoose.Types.ObjectId,
    title: string,
    message: string,
    type: 'system' | 'assessment' | 'practice' | 'expert_session',
    link?: string
  ): Promise<void> {
    try {
      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        title,
        message,
        type,
        link,
        isRead: false,
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
}
