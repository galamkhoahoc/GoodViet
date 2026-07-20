import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';
import { runWithRequestSessionWrite } from '../middleware/auth.middleware';
import validator from 'validator';

/**
 * User controller
 */
export class UserController {
  /**
   * GET /api/users/profile
   * Get current user's profile
   */
  static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      // Find user
      const user = await User.findById(userId).select('-passwordHash');

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Send response
      res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          accountType: user.accountType,
          isActive: user.isActive,
          verifiedEmail: user.verifiedEmail,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          profileImageUrl: user.profileImageUrl,
          targetGoals: user.targetGoals,
          learningStyle: user.learningStyle,
          assessmentCompleted: user.assessmentCompleted,
          currentPathwayId: user.currentPathwayId,
          totalRecordings: user.totalRecordings,
          totalPracticeTime: user.totalPracticeTime,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/profile
   * Update current user's profile
   */
  static async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const allowedFields = [
        'fullName',
        'phoneNumber',
        'dateOfBirth',
        'profileImageUrl',
        'targetGoals',
        'learningStyle',
      ] as const;
      const updates: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (typeof updates.fullName === 'string') {
        updates.fullName = validator.escape(updates.fullName.trim());
      }
      if (typeof updates.targetGoals === 'string') {
        updates.targetGoals = validator.escape(updates.targetGoals.trim());
      }

      // Find and update user
      const user = await runWithRequestSessionWrite(req, () => User.findByIdAndUpdate(
          userId,
          { $set: updates },
          { new: true, runValidators: true }
        ).select('-passwordHash')
      );

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Send response
      res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          accountType: user.accountType,
          isActive: user.isActive,
          verifiedEmail: user.verifiedEmail,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          profileImageUrl: user.profileImageUrl,
          targetGoals: user.targetGoals,
          learningStyle: user.learningStyle,
          assessmentCompleted: user.assessmentCompleted,
          currentPathwayId: user.currentPathwayId,
          totalRecordings: user.totalRecordings,
          totalPracticeTime: user.totalPracticeTime,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
