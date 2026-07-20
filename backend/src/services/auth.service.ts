import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { TemporaryAccountService } from './temporary-account.service';

/**
 * JWT payload interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  accountType: 'standard' | 'temporary';
  sessionVersion: number;
}

/**
 * Salt rounds for bcrypt hashing
 */
const SALT_ROUNDS = 12;

/**
 * JWT expiration time (7 days)
 */
const JWT_EXPIRES_IN = '7d';

/**
 * Authentication service
 */
export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate a JWT token for a user
   */
  static generateToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role ?? 'user',
      accountType: user.accountType ?? 'standard',
      sessionVersion: user.sessionVersion ?? 0,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'goodviet-api',
      audience: 'goodviet-client',
    });
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: 'goodviet-api',
        audience: 'goodviet-client',
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Register a new user
   */
  static async register(data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    age?: number;
    targetGoals?: string;
  }): Promise<{ user: IUser; token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user
    const user = await User.create({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      age: data.age,
      targetGoals: data.targetGoals,
      verifiedEmail: true, // For MVP, auto-verify
    });

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Login a user
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    // Find user by email
    let user = await User.findOne({ email }) as IUser | null;
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // A temporary account is reset before every token issuance. This is the
    // backstop for closed tabs, expired sessions, and failed logout requests.
    if (user.accountType === 'temporary') {
      const resetResult = await TemporaryAccountService.reset(user._id);
      const resetUser = resetResult.user;

      // Claim the freshly reset epoch with one conditional database write.
      // A concurrent login/reset either runs after this update (and clears it)
      // or changes the epoch first (and this update fails), so lastLoginAt can
      // never be written after a newer reset has completed.
      const claimedUser = await User.findOneAndUpdate(
        {
          _id: resetUser._id,
          accountType: 'temporary',
          sessionVersion: resetUser.sessionVersion,
          resetInProgress: false,
          isActive: true,
        },
        { $set: { lastLoginAt: new Date() } },
        { new: true }
      );
      if (!claimedUser) {
        throw new Error('Temporary account changed during login; please retry');
      }
      user = claimedUser;
    } else {
      // Standard accounts do not participate in temporary reset fencing.
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * End a session. Standard accounts keep their data; temporary accounts are
   * fully reset and have all previously issued temporary JWTs invalidated.
   */
  static async logout(
    userId: string,
    expectedSessionVersion: number
  ): Promise<{ dataReset: boolean }> {
    const user = await User.findById(userId).select('+sessionVersion +resetInProgress');

    if (!user) {
      throw new Error('User not found');
    }

    if (user.accountType !== 'temporary') {
      return { dataReset: false };
    }

    if (
      !Number.isInteger(expectedSessionVersion)
      || user.sessionVersion !== expectedSessionVersion
    ) {
      throw new Error('Temporary account session is no longer active');
    }

    await TemporaryAccountService.reset(user._id, expectedSessionVersion);
    return { dataReset: true };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }
}
