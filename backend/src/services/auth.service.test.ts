import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { TemporaryAccountService } from './temporary-account.service';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../models/User');
jest.mock('./temporary-account.service');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with 12 salt rounds', async () => {
      // Arrange
      const plainPassword = 'Test1234';
      const hashedPassword = 'hashed_password_here';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Act
      const result = await AuthService.hashPassword(plainPassword);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 12);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password', async () => {
      // Arrange
      const plainPassword = 'Test1234';
      const hashedPassword = 'hashed_password_here';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await AuthService.verifyPassword(plainPassword, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      // Arrange
      const plainPassword = 'WrongPassword';
      const hashedPassword = 'hashed_password_here';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await AuthService.verifyPassword(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with correct payload and options', () => {
      // Arrange
      const mockUser = {
        _id: { toString: () => 'user123' },
        email: 'test@example.com',
      } as any;

      const mockToken = 'jwt.token.here';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = AuthService.generateToken(mockUser);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: 'user123',
          email: 'test@example.com',
          role: 'user',
          accountType: 'standard',
          sessionVersion: 0,
        },
        env.JWT_SECRET,
        {
          expiresIn: '7d',
          issuer: 'goodviet-api',
          audience: 'goodviet-client',
        }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode valid JWT token', () => {
      // Arrange
      const token = 'valid.jwt.token';
      const decodedPayload = {
        userId: 'user123',
        email: 'test@example.com',
      };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      // Act
      const result = AuthService.verifyToken(token);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, env.JWT_SECRET, {
        issuer: 'goodviet-api',
        audience: 'goodviet-client',
      });
      expect(result).toEqual(decodedPayload);
    });

    it('should throw error for expired token', () => {
      // Arrange
      const token = 'expired.jwt.token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      // Act & Assert
      expect(() => AuthService.verifyToken(token)).toThrow('Token expired');
    });

    it('should throw error for invalid token', () => {
      // Arrange
      const token = 'invalid.jwt.token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      // Act & Assert
      expect(() => AuthService.verifyToken(token)).toThrow('Invalid token');
    });
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

      const hashedPassword = 'hashed_password';
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        fullName: 'Test User',
        phoneNumber: '0912345678',
        createdAt: new Date(),
      } as any;

      const mockToken = 'jwt.token.here';

      (User.findOne as jest.Mock).mockResolvedValue(null); // No existing user
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = await AuthService.register(registrationData);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: registrationData.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(registrationData.password, 12);
      expect(User.create).toHaveBeenCalledWith({
        email: registrationData.email,
        passwordHash: hashedPassword,
        fullName: registrationData.fullName,
        phoneNumber: registrationData.phoneNumber,
        verifiedEmail: true,
      });
      expect(result).toEqual({
        user: mockUser,
        token: mockToken,
      });
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const registrationData = {
        email: 'existing@example.com',
        password: 'Test1234',
        fullName: 'Test User',
      };

      const existingUser = {
        _id: 'existing123',
        email: 'existing@example.com',
      } as any;

      (User.findOne as jest.Mock).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(AuthService.register(registrationData)).rejects.toThrow(
        'Email already registered'
      );

      // Verify user creation was not attempted
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should register without optional phone number', async () => {
      // Arrange
      const registrationData = {
        email: 'test@example.com',
        password: 'Test1234',
        fullName: 'Test User',
        // No phoneNumber
      };

      const hashedPassword = 'hashed_password';
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        fullName: 'Test User',
        createdAt: new Date(),
      } as any;

      const mockToken = 'jwt.token.here';

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = await AuthService.register(registrationData);

      // Assert
      expect(User.create).toHaveBeenCalledWith({
        email: registrationData.email,
        passwordHash: hashedPassword,
        fullName: registrationData.fullName,
        phoneNumber: undefined,
        verifiedEmail: true,
      });
      expect(result.user).toBe(mockUser);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'Test1234';

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        fullName: 'Test User',
        isActive: true,
        lastLoginAt: undefined,
        save: jest.fn().mockResolvedValue(true),
      } as any;

      const mockToken = 'jwt.token.here';

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = await AuthService.login(email, password);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.passwordHash);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.lastLoginAt).toBeDefined();
      expect(result).toEqual({
        user: mockUser,
        token: mockToken,
      });
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'Test1234';

      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.login(email, password)).rejects.toThrow(
        'Invalid credentials'
      );

      // Verify password was not checked
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error for incorrect password', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'WrongPassword';

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        isActive: true,
      } as any;

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(AuthService.login(email, password)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error for deactivated account', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'Test1234';

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        isActive: false, // Account deactivated
      } as any;

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(AuthService.login(email, password)).rejects.toThrow(
        'Account is deactivated'
      );
    });

    it('should reset a temporary account before issuing its next token', async () => {
      const temporaryUser = {
        _id: 'guest-user',
        email: 'guest@goodviet.glkh.vn',
        passwordHash: 'hashed_password',
        isActive: true,
        accountType: 'temporary',
      } as any;
      const cleanUser = {
        ...temporaryUser,
        role: 'user',
        sessionVersion: 4,
      } as any;
      const claimedUser = { ...cleanUser, lastLoginAt: new Date() } as any;

      (User.findOne as jest.Mock).mockResolvedValue(temporaryUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (TemporaryAccountService.reset as jest.Mock).mockResolvedValue({ user: cleanUser });
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue(claimedUser);
      (jwt.sign as jest.Mock).mockReturnValue('guest.jwt');

      const result = await AuthService.login(temporaryUser.email, 'GuestPassword1');

      expect(TemporaryAccountService.reset).toHaveBeenCalledWith(temporaryUser._id);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: cleanUser._id,
          accountType: 'temporary',
          sessionVersion: 4,
          resetInProgress: false,
          isActive: true,
        },
        { $set: { lastLoginAt: expect.any(Date) } },
        { new: true }
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          accountType: 'temporary',
          sessionVersion: 4,
        }),
        env.JWT_SECRET,
        expect.any(Object)
      );
      expect(result).toEqual({ user: claimedUser, token: 'guest.jwt' });
    });

    it('does not write login state through a newer temporary reset epoch', async () => {
      const temporaryUser = {
        _id: 'guest-user',
        email: 'guest@goodviet.glkh.vn',
        passwordHash: 'hashed_password',
        isActive: true,
        accountType: 'temporary',
      } as any;
      const cleanUser = { ...temporaryUser, sessionVersion: 4 } as any;

      (User.findOne as jest.Mock).mockResolvedValue(temporaryUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (TemporaryAccountService.reset as jest.Mock).mockResolvedValue({ user: cleanUser });
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.login(temporaryUser.email, 'GuestPassword1')).rejects.toThrow(
        'Temporary account changed during login; please retry'
      );
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('keeps standard account data', async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user123', accountType: 'standard' }),
      });

      await expect(AuthService.logout('user123', 0)).resolves.toEqual({ dataReset: false });
      expect(TemporaryAccountService.reset).not.toHaveBeenCalled();
    });

    it('resets temporary account data', async () => {
      const guest = { _id: 'guest-user', accountType: 'temporary', sessionVersion: 9 };
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(guest),
      });
      (TemporaryAccountService.reset as jest.Mock).mockResolvedValue({});

      await expect(AuthService.logout('guest-user', 9)).resolves.toEqual({ dataReset: true });
      expect(TemporaryAccountService.reset).toHaveBeenCalledWith('guest-user', 9);
    });

    it('does not let a stale logout reset a newer temporary session', async () => {
      const guest = { _id: 'guest-user', accountType: 'temporary', sessionVersion: 10 };
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(guest),
      });

      await expect(AuthService.logout('guest-user', 9)).rejects.toThrow(
        'Temporary account session is no longer active'
      );
      expect(TemporaryAccountService.reset).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 'user123';
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        fullName: 'Test User',
      } as any;

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.getUserById(userId);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'nonexistent123';

      (User.findById as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await AuthService.getUserById(userId);

      // Assert
      expect(result).toBeNull();
    });
  });
});
