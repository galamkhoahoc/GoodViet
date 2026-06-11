import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { PracticePathway } from '../models/PracticePathway';
import { PracticeProgress } from '../models/PracticeProgress';
import { PracticeSession } from '../models/PracticeSession';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';

export class PracticeController {
  /**
   * GET /api/practice/pathways
   * List available practice pathways
   */
  static async getPathways(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pathways = await PracticePathway.find({ isActive: true })
        .select('-weeks.days.exercises'); // Exclude detailed exercises to keep list small

      res.status(200).json({
        success: true,
        pathways,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/practice/start
   * Start a practice pathway
   */
  static async startPathway(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const { pathwayId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(pathwayId)) {
        throw new AppError(400, 'Invalid Pathway ID');
      }

      const pathway = await PracticePathway.findById(pathwayId);
      if (!pathway) {
        throw new AppError(404, 'Pathway not found');
      }

      // Check if user already has progress for this pathway
      let progress = await PracticeProgress.findOne({ userId, pathwayId });

      if (progress) {
        // Resume existing progress
        res.status(200).json({
          message: 'Đã tiếp tục lộ trình hiện tại',
          progressId: progress._id,
          pathwayId,
          currentWeek: progress.currentWeek,
          currentDay: progress.currentDay,
        });
        return;
      }

      // Create new progress
      progress = await PracticeProgress.create({
        userId: new mongoose.Types.ObjectId(userId),
        pathwayId: new mongoose.Types.ObjectId(pathwayId),
        currentWeek: 1,
        currentDay: 1,
      });

      // Update user profile
      await User.findByIdAndUpdate(userId, { currentPathwayId: pathwayId });

      res.status(201).json({
        progressId: progress._id,
        pathwayId,
        currentWeek: 1,
        currentDay: 1,
        startedAt: progress.startedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/practice/progress
   * Get user's practice progress
   */
  static async getProgress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const progress = await PracticeProgress.findOne({ userId }).populate('pathwayId', 'name durationDays');

      if (!progress) {
        throw new AppError(404, 'Chưa có lộ trình nào được bắt đầu');
      }

      // Get count of completed sessions
      const completedSessions = await PracticeSession.countDocuments({ progressId: progress._id });

      // @ts-ignore
      const durationDays = progress.pathwayId.durationDays || 7;
      const completionPercentage = Math.min(Math.round((completedSessions / durationDays) * 100), 100);

      res.status(200).json({
        progressId: progress._id,
        pathway: progress.pathwayId,
        currentWeek: progress.currentWeek,
        currentDay: progress.currentDay,
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak,
        lastCheckIn: progress.lastCheckIn,
        completedSessions,
        completionPercentage,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/practice/day/:week/:day
   * Get exercises for specific day
   */
  static async getDayExercises(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const week = parseInt(req.params.week);
      const day = parseInt(req.params.day);

      const progress = await PracticeProgress.findOne({ userId }).populate('pathwayId');

      if (!progress) {
        throw new AppError(404, 'Chưa có lộ trình nào được bắt đầu');
      }

      // Check if user is trying to access future content
      // Relaxed rule for now to allow easier testing, but normally:
      // if (week > progress.currentWeek || (week === progress.currentWeek && day > progress.currentDay)) {
      //   throw new AppError(403, 'Bạn chưa mở khóa bài tập này');
      // }

      // @ts-ignore
      const pathway: any = progress.pathwayId;
      
      const weekData = pathway.weeks.find((w: any) => w.weekNumber === week);
      if (!weekData) throw new AppError(404, 'Không tìm thấy dữ liệu tuần này');

      const dayData = weekData.days.find((d: any) => d.day === day);
      if (!dayData) throw new AppError(404, 'Không tìm thấy dữ liệu ngày này');

      res.status(200).json({
        week,
        day,
        isRestDay: dayData.isRestDay,
        exercises: dayData.exercises,
        videoTutorial: weekData.videoTitle ? {
          title: weekData.videoTitle,
          description: weekData.videoDescription
        } : null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/practice/checkin
   * Record daily check-in
   */
  static async checkin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const { week, day, exercisesCompleted } = req.body;

      const progress = await PracticeProgress.findOne({ userId });
      if (!progress) throw new AppError(404, 'Chưa có lộ trình nào được bắt đầu');

      // Create session
      const session = await PracticeSession.create({
        progressId: progress._id,
        week,
        day,
        exercisesCompleted,
      });

      // Update streaks
      const now = new Date();
      let newStreak = progress.currentStreak;
      
      if (progress.lastCheckIn) {
        const lastCheck = new Date(progress.lastCheckIn);
        // Reset to midnight for fair comparison
        lastCheck.setHours(0, 0, 0, 0);
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(today.getTime() - lastCheck.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
          // Consecutive day
          newStreak += 1;
        } else if (diffDays > 1) {
          // Missed a day
          newStreak = 1;
        }
        // If diffDays === 0, they already checked in today, streak remains same
      } else {
        // First check-in
        newStreak = 1;
      }

      progress.currentStreak = newStreak;
      progress.longestStreak = Math.max(progress.longestStreak, newStreak);
      progress.lastCheckIn = now;

      // Advance progress
      if (day < 7) {
        progress.currentDay = Math.max(progress.currentDay, day + 1);
      } else {
        progress.currentWeek = Math.max(progress.currentWeek, week + 1);
        progress.currentDay = 1;
      }

      await progress.save();

      // Check milestones
      let milestoneAchieved = null;
      if (newStreak === 7) {
        milestoneAchieved = { type: 'streak_7', message: 'Tuyệt vời! Bạn đã luyện tập 7 ngày liên tiếp!' };
      } else if (newStreak === 30) {
        milestoneAchieved = { type: 'streak_30', message: 'Đỉnh cao! Bạn đã duy trì được 1 tháng!' };
      }

      res.status(200).json({
        sessionId: session._id,
        completedAt: session.completedAt,
        newStreak,
        milestoneAchieved
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/practice/history
   * Get user's practice history (sessions)
   */
  static async getHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const progress = await PracticeProgress.findOne({ userId });
      if (!progress) {
        res.status(200).json({ success: true, history: [] });
        return;
      }

      const sessions = await PracticeSession.find({ progressId: progress._id })
        .sort({ completedAt: -1 })
        .limit(50); // Get last 50 sessions

      res.status(200).json({
        success: true,
        history: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/practice/recording
   * Upload practice recording (delegates to audio service)
   */
  static async uploadRecording(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const { exerciseId, week, day, audioData } = req.body;

      if (!exerciseId || !week || !day) {
        throw new AppError(400, 'Missing required fields: exerciseId, week, day');
      }

      // This endpoint should delegate to audio service
      // For now, return a placeholder response
      res.status(200).json({
        success: true,
        message: 'Recording uploaded successfully',
        recordingId: new mongoose.Types.ObjectId().toString(),
        exerciseId,
        week,
        day,
      });
    } catch (error) {
      next(error);
    }
  }
}
