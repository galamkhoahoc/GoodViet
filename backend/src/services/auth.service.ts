import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';

/**
 * JWT payload interface
 */
interface JWTPayload {
  userId: string;
  email: string;
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
    const user = await User.findOne({ email });
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

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }
}
