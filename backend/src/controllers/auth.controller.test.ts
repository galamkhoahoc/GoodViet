import { Request, Response, NextFunction } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';

// Mock the AuthService
jest.mock('../services/auth.service');

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      body: {},
    };

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Setup mock next
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const registrationData = {
        email: 'test@example.com',
        password: 'Test1234',
        fullName: 'Test User',
        phoneNumber: '0912345678',
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '0912345678',
        createdAt: new Date(),
      };

      const mockToken = 'jwt.token.here';

      mockRequest.body = registrationData;
      (AuthService.register as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      // Act
      await AuthController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(AuthService.register).toHaveBeenCalledWith(registrationData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: {
          id: mockUser._id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          phoneNumber: mockUser.phoneNumber,
          createdAt: mockUser.createdAt,
        },
        token: mockToken,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 409 when email already exists', async () => {
      // Arrange
      const registrationData = {
        email: 'existing@example.com',
        password: 'Test1234',
        fullName: 'Test User',
      };

      mockRequest.body = registrationData;
      (AuthService.register as jest.Mock).mockRejectedValue(
        new Error('Email already registered')
      );

      // Act
      await AuthController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          message: 'Email đã được đăng ký',
        })
      );
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const registrationData = {
        email: 'test@example.com',
        password: 'Test1234',
        fullName: 'Test User',
      };

      const unexpectedError = new Error('Database error');
      mockRequest.body = registrationData;
      (AuthService.register as jest.Mock).mockRejectedValue(unexpectedError);

      // Act
      await AuthController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });

    it('should register without phone number (optional field)', async () => {
      // Arrange
      const registrationData = {
        email: 'test@example.com',
        password: 'Test1234',
        fullName: 'Test User',
        // phoneNumber is optional
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        fullName: 'Test User',
        createdAt: new Date(),
      };

      const mockToken = 'jwt.token.here';

      mockRequest.body = registrationData;
      (AuthService.register as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      // Act
      await AuthController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(AuthService.register).toHaveBeenCalledWith(registrationData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'Test1234',
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '0912345678',
        assessmentCompleted: false,
        lastLoginAt: new Date(),
      };

      const mockToken = 'jwt.token.here';

      mockRequest.body = loginData;
      (AuthService.login as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      // Act
      await AuthController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(AuthService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: {
          id: mockUser._id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          phoneNumber: mockUser.phoneNumber,
          assessmentCompleted: mockUser.assessmentCompleted,
          currentPathwayId: undefined,
          lastLoginAt: mockUser.lastLoginAt,
        },
        token: mockToken,
      });
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockRequest.body = loginData;
      (AuthService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );

      // Act
      await AuthController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Email hoặc mật khẩu không đúng',
        })
      );
    });

    it('should return 403 for deactivated account', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'Test1234',
      };

      mockRequest.body = loginData;
      (AuthService.login as jest.Mock).mockRejectedValue(
        new Error('Account is deactivated')
      );

      // Act
      await AuthController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Tài khoản đã bị vô hiệu hóa',
        })
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Act
      await AuthController.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Đăng xuất thành công',
      });
    });
  });
});
