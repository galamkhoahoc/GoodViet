import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';
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
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          profileImageUrl: user.profileImageUrl,
          targetGoals: user.targetGoals,
          learningStyle: user.learningStyle,
          assessmentCompleted: user.assessmentCompleted,
          currentPathwayId: user.currentPathwayId,
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

      const updates: any = { ...req.body };

      if (updates.fullName) {
        updates.fullName = validator.escape(updates.fullName.trim());
      }
      if (updates.targetGoals) {
        updates.targetGoals = validator.escape(updates.targetGoals.trim());
      }

      // Find and update user
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-passwordHash');

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Send response
      res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          profileImageUrl: user.profileImageUrl,
          targetGoals: user.targetGoals,
          learningStyle: user.learningStyle,
          assessmentCompleted: user.assessmentCompleted,
          currentPathwayId: user.currentPathwayId,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
