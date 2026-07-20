import type { NextFunction, Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { runWithRequestSessionWrite } from '../middleware/auth.middleware';
import { NotificationController } from './notification.controller';

jest.mock('../models/Notification');
jest.mock('../models/User');
jest.mock('../middleware/error.middleware', () => ({
  AppError: class AppError extends Error {
    constructor(public statusCode: number, message: string) {
      super(message);
    }
  },
}), { virtual: true });
jest.mock('../middleware/auth.middleware', () => ({
  runWithRequestSessionWrite: jest.fn((_context, operation) => operation()),
}));

const userId = '507f1f77bcf86cd799439011';

function createResponse(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('NotificationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters and counts unread notifications using the read field', async () => {
    const notifications = [{ _id: 'notification-1', read: false }];
    const query: any = {
      sort: jest.fn(),
      limit: jest.fn(),
    };
    query.sort.mockReturnValue(query);
    query.limit.mockResolvedValue(notifications);
    (Notification.find as jest.Mock).mockReturnValue(query);
    (Notification.countDocuments as jest.Mock).mockResolvedValue(1);
    const request = {
      userId,
      query: { unreadOnly: 'true', limit: '10' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn() as NextFunction;

    await NotificationController.getNotifications(request, response, next);

    expect(Notification.find).toHaveBeenCalledWith({ userId, read: false });
    expect(query.sort).toHaveBeenCalledWith({ timestamp: -1 });
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(Notification.countDocuments).toHaveBeenCalledWith({ userId, read: false });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      notifications,
      unreadCount: 1,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('marks an owned notification as read inside the write-session wrapper', async () => {
    const notification = { _id: '507f1f77bcf86cd799439012', read: true };
    (Notification.findOneAndUpdate as jest.Mock).mockResolvedValue(notification);
    const request = {
      userId,
      params: { id: notification._id },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn() as NextFunction;

    await NotificationController.markAsRead(request, response, next);

    expect(runWithRequestSessionWrite).toHaveBeenCalledWith(request, expect.any(Function));
    expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: notification._id, userId },
      { $set: { read: true } },
      { new: true }
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ success: true, notification });
    expect(next).not.toHaveBeenCalled();
  });

  it('creates model-compatible fields and types inside the write-session wrapper', async () => {
    const select = jest.fn().mockResolvedValue({
      _id: userId,
      accountType: 'standard',
      sessionVersion: 0,
      isActive: true,
    });
    (User.findById as jest.Mock).mockReturnValue({ select });
    (Notification.create as jest.Mock).mockResolvedValue({ _id: 'notification-1' });

    await NotificationController.createNotification(
      userId,
      'Nhac nho',
      'Hay luyen tap hom nay',
      'reminder',
      '/practice'
    );

    expect(select).toHaveBeenCalledWith('accountType sessionVersion isActive');
    expect(runWithRequestSessionWrite).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        accountType: 'standard',
        sessionVersion: 0,
      }),
      expect.any(Function)
    );
    expect(Notification.create).toHaveBeenCalledWith({
      userId: expect.anything(),
      title: 'Nhac nho',
      message: 'Hay luyen tap hom nay',
      type: 'reminder',
      actionUrl: '/practice',
      read: false,
    });
  });
});
