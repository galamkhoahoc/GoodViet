import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * Login rate limiter
 * Limits: 5 attempts per 15 minutes per email
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => {
    // Rate limit by email instead of IP
    return req.body.email || req.ip || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng đợi 15 phút.',
      retryAfter: 15 * 60, // seconds
    });
  },
});

/**
 * Registration rate limiter
 * Limits: 3 registrations per hour per IP
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: {
    error: 'Too many registration attempts',
    message: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.',
  },
});

/**
 * Chat rate limiter
 * Limits: 20 messages per minute per user
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  keyGenerator: (req) => {
    // Rate limit by userId if authenticated
    return req.userId || req.ip || 'unknown';
  },
  message: {
    error: 'Too many messages',
    message: 'Bạn gửi tin nhắn quá nhanh. Vui lòng chậm lại.',
  },
});

/**
 * Upload rate limiter
 * Limits: 10 uploads per minute
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    error: 'Too many upload attempts',
    message: 'Bạn tải lên quá nhanh. Vui lòng chậm lại.',
  },
});
