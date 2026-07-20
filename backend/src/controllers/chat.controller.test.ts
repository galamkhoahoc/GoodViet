import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { ChatMessage } from '../models/ChatMessage';
import { ChatSession } from '../models/ChatSession';
import { runWithRequestSessionWrite } from '../middleware/auth.middleware';
import { aiService } from '../services/ai.service';
import { ChatController } from './chat.controller';

jest.mock('../models/ChatMessage');
jest.mock('../models/ChatSession');
jest.mock('../services/ai.service', () => ({
  aiService: { generateChatResponse: jest.fn() },
}));
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    req.userId = '507f1f77bcf86cd799439011';
    next();
  },
  runWithRequestSessionWrite: jest.fn((_context, operation) => operation()),
}));

const { authMiddleware } = require('../middleware/auth.middleware');
const app = express();
app.use(express.json());
app.post('/api/chat/messages', authMiddleware, ChatController.sendMessage);
app.get('/api/chat/history', authMiddleware, ChatController.getHistory);
app.delete('/api/chat/sessions/:id', authMiddleware, ChatController.deleteSession);
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(error.statusCode || 500).json({ message: error.message });
});

function historyQuery(messages: any[]) {
  const query: any = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
  };
  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockImplementation(() => query);
  query.lean.mockResolvedValue(messages);
  query.then = (resolve: (value: any[]) => unknown) => Promise.resolve(messages).then(resolve);
  return query;
}

describe('ChatController routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if content is missing', async () => {
    const response = await request(app).post('/api/chat/messages').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Nội dung tin nhắn không được để trống');
    expect(ChatMessage.create).not.toHaveBeenCalled();
  });

  it('sanitizes content and persists the user and bot messages', async () => {
    (ChatMessage.create as jest.Mock)
      .mockResolvedValueOnce({ _id: 'user-message' })
      .mockResolvedValueOnce({ _id: 'bot-message' });
    (ChatMessage.find as jest.Mock).mockReturnValue(historyQuery([]));
    (aiService.generateChatResponse as jest.Mock).mockResolvedValue('Phản hồi an toàn');

    const response = await request(app)
      .post('/api/chat/messages')
      .send({ content: '<script>alert("xss")</script>' });

    expect(response.status).toBe(201);
    expect(ChatMessage.create).toHaveBeenCalledTimes(2);
    const savedUserMessage = (ChatMessage.create as jest.Mock).mock.calls[0][0];
    expect(savedUserMessage.content).not.toContain('<script>');
    expect(aiService.generateChatResponse).toHaveBeenCalled();
    expect(response.body).toEqual(expect.objectContaining({ success: true }));
  });

  it('checks session ownership inside the same write transaction before creating messages', async () => {
    const sessionId = '507f191e810c19729de860ea';
    (ChatSession.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: sessionId });
    (ChatMessage.create as jest.Mock)
      .mockResolvedValueOnce({ _id: 'user-message' })
      .mockResolvedValueOnce({ _id: 'bot-message' });
    (ChatMessage.find as jest.Mock).mockReturnValue(historyQuery([]));
    (aiService.generateChatResponse as jest.Mock).mockResolvedValue('Pháº£n há»“i an toÃ n');

    const response = await request(app)
      .post('/api/chat/messages')
      .send({ content: 'Xin chÃ o', sessionId });

    expect(response.status).toBe(201);
    expect(ChatSession.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(ChatSession.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { _id: sessionId, userId: '507f1f77bcf86cd799439011' },
      {
        $set: { lastMessageAt: expect.any(Date) },
        $inc: { mutationVersion: 1 },
      },
      { new: true }
    );
    expect(runWithRequestSessionWrite).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      { transactionForStandard: true }
    );
  });

  it('does not create a message for a missing or foreign session', async () => {
    (ChatSession.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post('/api/chat/messages')
      .send({ content: 'Xin chÃ o', sessionId: '507f191e810c19729de860ea' });

    expect(response.status).toBe(404);
    expect(ChatMessage.create).not.toHaveBeenCalled();
    expect(aiService.generateChatResponse).not.toHaveBeenCalled();
  });

  it('returns chat history for the authenticated user', async () => {
    const messages = [{ _id: 'message-1', content: 'Xin chào' }];
    (ChatMessage.find as jest.Mock).mockReturnValue(historyQuery(messages));

    const response = await request(app).get('/api/chat/history');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      messages,
      hasMore: false,
    });
  });

  it('atomically deletes only an owned session and its owned messages', async () => {
    const sessionId = '507f191e810c19729de860ea';
    (ChatSession.findOneAndDelete as jest.Mock).mockResolvedValue({ _id: sessionId });
    (ChatMessage.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });

    const response = await request(app).delete(`/api/chat/sessions/${sessionId}`);

    expect(response.status).toBe(200);
    expect(ChatSession.findOneAndDelete).toHaveBeenCalledWith({
      _id: sessionId,
      userId: '507f1f77bcf86cd799439011',
    });
    expect(ChatMessage.deleteMany).toHaveBeenCalledWith({
      sessionId,
      userId: '507f1f77bcf86cd799439011',
    });
    expect(runWithRequestSessionWrite).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      { transactionForStandard: true }
    );
  });

  it('does not delete messages when the session is missing or foreign', async () => {
    (ChatSession.findOneAndDelete as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .delete('/api/chat/sessions/507f191e810c19729de860ea');

    expect(response.status).toBe(404);
    expect(ChatMessage.deleteMany).not.toHaveBeenCalled();
  });
});
