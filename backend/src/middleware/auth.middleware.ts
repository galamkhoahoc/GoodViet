import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

/**
 * Extend Express Request to include user data
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'No token provided',
        message: 'Authorization header with Bearer token is required',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = AuthService.verifyToken(token);

    // Attach user info to request
    req.userId = payload.userId;
    req.userEmail = payload.email;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired. Please login again.',
        });
      } else if (error.message === 'Invalid token') {
        res.status(401).json({
          error: 'Invalid token',
          message: 'Invalid authentication token',
        });
      } else {
        res.status(401).json({
          error: 'Authentication failed',
          message: error.message,
        });
      }
    } else {
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = AuthService.verifyToken(token);
      req.userId = payload.userId;
      req.userEmail = payload.email;
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
}
