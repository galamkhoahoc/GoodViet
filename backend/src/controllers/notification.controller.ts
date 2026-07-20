import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';
import {
  RequestSessionContext,
  runWithRequestSessionWrite,
} from '../middleware/auth.middleware';

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
        query.read = false;
      }

      const notifications = await Notification.find(query)
        .sort({ timestamp: -1 })
        .limit(limit);

      const unreadCount = await Notification.countDocuments({ userId, read: false });

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

      const notification = await runWithRequestSessionWrite(req, () => Notification.findOneAndUpdate(
        { _id: id, userId },
        { $set: { read: true } },
        { new: true }
      ));

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
    type: NotificationType,
    actionUrl?: string,
    sessionContext?: RequestSessionContext
  ): Promise<void> {
    try {
      const owner = await User.findById(userId).select('accountType sessionVersion isActive');
      if (!owner?.isActive) return;

      // Background callers must carry the originating epoch for a temporary
      // account. Without it, a late notification could leak into a later guest
      // session, so fail closed.
      if (owner.accountType === 'temporary' && !sessionContext) return;

      const context = sessionContext ?? {
        userId: owner._id.toString(),
        accountType: owner.accountType,
        sessionVersion: owner.sessionVersion,
      };
      await runWithRequestSessionWrite(context, () => Notification.create({
          userId: new mongoose.Types.ObjectId(userId),
          title,
          message,
          type,
          actionUrl,
          read: false,
        })
      );
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
}
