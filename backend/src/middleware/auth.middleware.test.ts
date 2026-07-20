import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { AuthService } from '../services/auth.service';
import {
  authMiddleware,
  runWithRequestSessionWrite,
} from './auth.middleware';

jest.mock('../models/User');
jest.mock('../services/auth.service');

const selectedUser = (value: unknown) => ({
  select: jest.fn().mockResolvedValue(value),
});

describe('authMiddleware database-backed sessions', () => {
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    request = { headers: { authorization: 'Bearer token' } };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('accepts a current temporary account session using database account state', async () => {
    (AuthService.verifyToken as jest.Mock).mockReturnValue({
      userId: 'guest-user',
      email: 'old-email@example.com',
      role: 'admin',
      accountType: 'temporary',
      sessionVersion: 5,
    });
    (User.findById as jest.Mock).mockReturnValue(selectedUser({
      email: 'guest@goodviet.glkh.vn',
      role: 'user',
      accountType: 'temporary',
      sessionVersion: 5,
      resetInProgress: false,
      isActive: true,
    }));

    await authMiddleware(request as Request, response as Response, next);

    expect(User.findById).toHaveBeenCalledWith('guest-user');
    expect(request.userEmail).toBe('guest@goodviet.glkh.vn');
    expect(request.userRole).toBe('user');
    expect(request.accountType).toBe('temporary');
    expect(request.sessionVersion).toBe(5);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects a stale temporary account token after reset', async () => {
    (AuthService.verifyToken as jest.Mock).mockReturnValue({
      userId: 'guest-user',
      sessionVersion: 4,
    });
    (User.findById as jest.Mock).mockReturnValue(selectedUser({
      email: 'guest@goodviet.glkh.vn',
      role: 'user',
      accountType: 'temporary',
      sessionVersion: 5,
      resetInProgress: false,
      isActive: true,
    }));

    await authMiddleware(request as Request, response as Response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      error: 'Invalid session',
      message: 'This temporary account session is no longer active.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a legacy JWT when the database account is now temporary', async () => {
    (AuthService.verifyToken as jest.Mock).mockReturnValue({
      userId: 'guest-user',
      email: 'guest@goodviet.glkh.vn',
    });
    (User.findById as jest.Mock).mockReturnValue(selectedUser({
      email: 'guest@goodviet.glkh.vn',
      role: 'user',
      accountType: 'temporary',
      sessionVersion: 1,
      resetInProgress: false,
      isActive: true,
    }));

    await authMiddleware(request as Request, response as Response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('loads standard account authority from the database', async () => {
    (AuthService.verifyToken as jest.Mock).mockReturnValue({
      userId: 'standard-user',
      email: 'user@example.com',
    });
    (User.findById as jest.Mock).mockReturnValue(selectedUser({
      email: 'user@example.com',
      role: 'admin',
      accountType: 'standard',
      sessionVersion: 0,
      resetInProgress: false,
      isActive: true,
    }));

    await authMiddleware(request as Request, response as Response, next);

    expect(User.findById).toHaveBeenCalledWith('standard-user');
    expect(request.userRole).toBe('admin');
    expect(request.accountType).toBe('standard');
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('temporary-account write transactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(mongoose.connection, 'transaction').mockImplementation(
      async (operation: any) => operation()
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('runs the session fence and mutation in one transaction', async () => {
    (User.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    const operation = jest.fn().mockResolvedValue('written');

    await expect(runWithRequestSessionWrite({
      userId: 'guest-user',
      accountType: 'temporary',
      sessionVersion: 7,
    }, operation)).resolves.toBe('written');

    expect(mongoose.connection.transaction).toHaveBeenCalledTimes(1);
    expect(User.updateOne).toHaveBeenCalledWith(
      {
        _id: 'guest-user',
        accountType: 'temporary',
        sessionVersion: 7,
        resetInProgress: false,
        isActive: true,
      },
      { $inc: { temporaryWriteFence: 1 } }
    );
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('can make a standard-account multi-document write transactional', async () => {
    const operation = jest.fn().mockResolvedValue('written');

    await expect(runWithRequestSessionWrite(
      { userId: 'standard-user', accountType: 'standard', sessionVersion: 0 },
      operation,
      { transactionForStandard: true }
    )).resolves.toBe('written');

    expect(mongoose.connection.transaction).toHaveBeenCalledTimes(1);
    expect(User.updateOne).not.toHaveBeenCalled();
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('does not run a write after reset has acquired the user fence', async () => {
    (User.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });
    const operation = jest.fn();

    await expect(runWithRequestSessionWrite({
      userId: 'guest-user',
      accountType: 'temporary',
      sessionVersion: 7,
    }, operation)).rejects.toMatchObject({ statusCode: 401 });

    expect(operation).not.toHaveBeenCalled();
    expect(User.updateOne).toHaveBeenCalledTimes(1);
  });
});
