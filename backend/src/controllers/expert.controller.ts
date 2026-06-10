import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Expert } from '../models/Expert';
import { ExpertConnection } from '../models/ExpertConnection';
import { ExpertSession } from '../models/ExpertSession';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';
import { emailService } from '../services/email.service';

/**
 * Expert controller
 */
export class ExpertController {
  /**
   * GET /api/experts
   * List available experts
   */
  static async getExperts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const specialization = req.query.specialization as string;
      const minRating = parseFloat(req.query.minRating as string) || 0;

      const query: any = { isActive: true };
      
      if (specialization) {
        query.specializations = specialization;
      }
      
      if (minRating > 0) {
        query.averageRating = { $gte: minRating };
      }

      const experts = await Expert.find(query).select('-email -phoneNumber');

      res.status(200).json({
        success: true,
        experts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/expert-connections
   * Request connection with an expert
   */
  static async requestConnection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const { expertId, message } = req.body;

      if (!mongoose.Types.ObjectId.isValid(expertId)) {
        throw new AppError(400, 'Invalid Expert ID');
      }

      const expert = await Expert.findById(expertId);
      if (!expert || !expert.isActive) {
        throw new AppError(404, 'Chuyên gia không tồn tại hoặc không hoạt động');
      }

      // Check if connection already exists
      const existingConnection = await ExpertConnection.findOne({ userId, expertId });
      
      if (existingConnection) {
        throw new AppError(409, 'Bạn đã gửi yêu cầu kết nối với chuyên gia này rồi');
      }

      const connection = await ExpertConnection.create({
        userId: new mongoose.Types.ObjectId(userId),
        expertId: new mongoose.Types.ObjectId(expertId),
        status: 'pending',
      });

      // Send email notification to expert
      const user = await User.findById(userId);
      if (user) {
        await emailService.sendExpertConnectionRequest(expert.email, user.fullName);
      }

      res.status(201).json({
        connectionId: connection._id,
        status: connection.status,
        message: 'Yêu cầu kết nối đã được gửi',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/expert-connections
   * Get user's expert connections
   */
  static async getConnections(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const connections = await ExpertConnection.find({ userId })
        .populate('expertId', 'fullName specializations profileImageUrl averageRating');

      res.status(200).json({
        success: true,
        connections: connections.map(conn => ({
          id: conn._id,
          status: conn.status,
          expert: conn.expertId,
          requestedAt: conn.requestedAt,
          respondedAt: conn.respondedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/expert-sessions
   * Book a session with an expert
   */
  static async bookSession(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const { connectionId, scheduledAt, duration, sessionType } = req.body;

      if (!mongoose.Types.ObjectId.isValid(connectionId)) {
        throw new AppError(400, 'Invalid Connection ID');
      }

      const connection = await ExpertConnection.findOne({ _id: connectionId, userId });
      
      if (!connection) {
        throw new AppError(404, 'Kết nối không tồn tại');
      }
      
      if (connection.status !== 'accepted') {
        throw new AppError(403, 'Chuyên gia chưa chấp nhận yêu cầu kết nối của bạn');
      }

      // Create session
      const session = await ExpertSession.create({
        connectionId: connection._id,
        expertId: connection.expertId,
        scheduledAt: new Date(scheduledAt),
        duration,
        sessionType,
        status: 'scheduled',
        meetingUrl: 'https://meet.google.com/mock-url-' + Math.random().toString(36).substring(7), // Mock URL
      });

      // Send confirmation emails
      const user = await User.findById(userId);
      if (user) {
        await emailService.sendSessionConfirmation(user.email, new Date(scheduledAt));
      }

      res.status(201).json({
        sessionId: session._id,
        status: session.status,
        meetingUrl: session.meetingUrl,
        message: 'Đặt lịch thành công',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/expert-sessions/:id/rate
   * Rate an expert session
   */
  static async rateSession(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const { id } = req.params;
      const { rating, feedback } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(400, 'Invalid Session ID');
      }

      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new AppError(400, 'Rating must be a number between 1 and 5');
      }

      const session = await ExpertSession.findById(id);
      
      if (!session) {
        throw new AppError(404, 'Session not found');
      }

      // Check if user owns this session by looking up connection
      const connection = await ExpertConnection.findOne({ _id: session.connectionId, userId });
      if (!connection) {
        throw new AppError(403, 'Bạn không có quyền đánh giá phiên này');
      }

      session.rating = rating;
      session.feedback = feedback;
      await session.save();

      // Recalculate expert's average rating
      const expert = await Expert.findById(session.expertId);
      if (expert) {
        const totalRatings = expert.totalRatings + 1;
        const averageRating = ((expert.averageRating * expert.totalRatings) + rating) / totalRatings;
        
        expert.totalRatings = totalRatings;
        expert.averageRating = averageRating;
        await expert.save();
      }

      res.status(200).json({
        success: true,
        message: 'Đánh giá thành công',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/expert-sessions
   * Get user's sessions
   */
  static async getSessions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      // First find user connections
      const connections = await ExpertConnection.find({ userId });
      const connectionIds = connections.map(c => c._id);

      const sessions = await ExpertSession.find({ connectionId: { $in: connectionIds } })
        .populate('expertId', 'fullName profileImageUrl')
        .sort({ scheduledAt: 1 });

      res.status(200).json({
        success: true,
        sessions,
      });
    } catch (error) {
      next(error);
    }
  }
}
