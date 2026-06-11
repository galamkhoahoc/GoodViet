import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';

/**
 * Authentication controller
 */
export class AuthController {
  /**
   * POST /api/users/register
   * Register a new user
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, fullName, phoneNumber, age, targetGoals } = req.body;

      // Register user
      const { user, token } = await AuthService.register({
        email,
        password,
        fullName,
        phoneNumber,
        age,
        targetGoals,
      });

      // Send response (exclude passwordHash)
      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          age: user.age,
          targetGoals: user.targetGoals,
          totalRecordings: user.totalRecordings,
          totalPracticeTime: user.totalPracticeTime,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        next(new AppError(409, 'Email đã được đăng ký'));
      } else {
        next(error);
      }
    }
  }

  /**
   * POST /api/users/login
   * Login a user
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      // Login user
      const { user, token } = await AuthService.login(email, password);

      // Send response (exclude passwordHash)
      res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          age: user.age,
          targetGoals: user.targetGoals,
          assessmentCompleted: user.assessmentCompleted,
          currentPathwayId: user.currentPathwayId,
          totalRecordings: user.totalRecordings,
          totalPracticeTime: user.totalPracticeTime,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastLoginAt: user.lastLoginAt,
        },
        token,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        next(new AppError(401, 'Email hoặc mật khẩu không đúng'));
      } else if (error instanceof Error && error.message === 'Account is deactivated') {
        next(new AppError(403, 'Tài khoản đã bị vô hiệu hóa'));
      } else {
        next(error);
      }
    }
  }

  /**
   * POST /api/users/logout
   * Logout a user (client-side token removal)
   */
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // In JWT authentication, logout is handled client-side
      // Server doesn't need to do anything
      res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công',
      });
    } catch (error) {
      next(error);
    }
  }
}
