import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';
import { AppError } from './error.middleware';

// Automatically attach the current transaction session to every Mongoose
// operation issued inside connection.transaction().
mongoose.set('transactionAsyncLocalStorage', true);

/**
 * Extend Express Request to include user data
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: 'user' | 'admin';
      accountType?: 'standard' | 'temporary';
      sessionVersion?: number;
    }
  }
}

export interface RequestSessionContext {
  userId?: string;
  accountType?: 'standard' | 'temporary';
  sessionVersion?: number;
}

export interface RequestSessionWriteOptions {
  /** Use a MongoDB transaction for standard accounts when a multi-document write must be atomic. */
  transactionForStandard?: boolean;
}

export function getRequestSessionContext(req: Request): RequestSessionContext {
  return {
    userId: req.userId,
    accountType: req.accountType,
    sessionVersion: req.sessionVersion,
  };
}

/** Re-check a temporary session immediately before a user-owned write. */
export async function isRequestSessionCurrent(context: RequestSessionContext): Promise<boolean> {
  if (context.accountType !== 'temporary') {
    return true;
  }
  if (
    !context.userId
    || typeof context.sessionVersion !== 'number'
    || !Number.isInteger(context.sessionVersion)
  ) {
    return false;
  }

  return Boolean(await User.exists({
    _id: context.userId,
    accountType: 'temporary',
    sessionVersion: context.sessionVersion,
    resetInProgress: false,
    isActive: true,
  }));
}

export async function assertRequestSessionCurrent(context: RequestSessionContext): Promise<void> {
  if (!(await isRequestSessionCurrent(context))) {
    throw new AppError(401, 'This temporary account session is no longer active.');
  }
}

/**
 * Commit a temporary-account mutation in the same MongoDB transaction as a
 * guaranteed-modifying increment to its User fence. Reset acquisition writes that same User
 * document, so MongoDB serializes the two operations without a check/write
 * gap. A crashed process has its transaction aborted by MongoDB and leaves no
 * durable counter that can strand the shared guest account.
 */
export async function runWithRequestSessionWrite<T>(
  context: RequestSessionContext,
  operation: () => Promise<T>,
  options: RequestSessionWriteOptions = {}
): Promise<T> {
  if (context.accountType !== 'temporary') {
    return options.transactionForStandard
      ? mongoose.connection.transaction(operation)
      : operation();
  }

  if (
    !context.userId
    || typeof context.sessionVersion !== 'number'
    || !Number.isInteger(context.sessionVersion)
  ) {
    throw new AppError(401, 'This temporary account session is no longer active.');
  }

  return mongoose.connection.transaction(async () => {
    const fence = await User.updateOne(
      {
        _id: context.userId,
        accountType: 'temporary',
        sessionVersion: context.sessionVersion,
        resetInProgress: false,
        isActive: true,
      },
      { $inc: { temporaryWriteFence: 1 } }
    );

    if (fence.matchedCount !== 1) {
      throw new AppError(401, 'This temporary account session is no longer active.');
    }

    return operation();
  });
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

    // Resolve account type and session state from the database rather than
    // trusting claims. This invalidates pre-deployment JWTs for an account that
    // was later converted into the shared temporary guest account.
    const currentUser = await User.findById(payload.userId)
      .select('email role accountType sessionVersion resetInProgress isActive');
    if (!currentUser || !currentUser.isActive) {
      throw new Error('Invalid token session');
    }
    if (
      currentUser.accountType === 'temporary'
      && (
        !Number.isInteger(payload.sessionVersion)
        || payload.sessionVersion !== currentUser.sessionVersion
        || currentUser.resetInProgress
      )
    ) {
      throw new Error('Invalid token session');
    }

    // Attach user info to request
    req.userId = payload.userId;
    req.userEmail = currentUser.email;
    req.userRole = currentUser.role ?? 'user';
    req.accountType = currentUser.accountType ?? 'standard';
    req.sessionVersion = currentUser.sessionVersion ?? 0;

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
      } else if (error.message === 'Invalid token session') {
        res.status(401).json({
          error: 'Invalid session',
          message: 'This temporary account session is no longer active.',
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

      const currentUser = await User.findById(payload.userId)
        .select('email role accountType sessionVersion resetInProgress isActive');
      if (!currentUser || !currentUser.isActive) {
        next();
        return;
      }
      if (
        currentUser.accountType === 'temporary'
        && (
          !Number.isInteger(payload.sessionVersion)
          || payload.sessionVersion !== currentUser.sessionVersion
          || currentUser.resetInProgress
        )
      ) {
        next();
        return;
      }

      req.userId = payload.userId;
      req.userEmail = currentUser.email;
      req.userRole = currentUser.role ?? 'user';
      req.accountType = currentUser.accountType ?? 'standard';
      req.sessionVersion = currentUser.sessionVersion ?? 0;
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
}
