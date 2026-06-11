import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { env, isDevelopment } from './config/env';
import { globalLimiter } from './middleware/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import audioRoutes from './routes/audio.routes';
import assessmentRoutes from './routes/assessment.routes';
import chatRoutes from './routes/chat.routes';
import practiceRoutes from './routes/practice.routes';
import expertRoutes from './routes/expert.routes';
import expertConnectionRoutes from './routes/expert-connection.routes';
import expertSessionRoutes from './routes/expert-session.routes';
import notificationRoutes from './routes/notification.routes';

/**
 * Create Express application
 */
export function createApp(): Application {
  const app = express();

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://i.pravatar.cc"],
        connectSrc: ["'self'", ...env.CORS_ORIGIN.split(',').map(o => o.trim()), "https://*.vercel.app"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // CORS configuration - support multiple origins
  const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowed => origin === allowed || origin.endsWith('.vercel.app'))) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request logging (only in development)
  if (isDevelopment) {
    app.use(morgan('dev'));
  }

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global rate limiting
  app.use('/api', globalLimiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      storage: env.AWS_ACCESS_KEY_ID && env.S3_BUCKET_NAME ? 'AWS S3' : 'MongoDB GridFS',
    });
  });

  // Root endpoint - API information
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'GoodViet API',
      version: '1.0.0',
      description: 'Backend API for GoodViet - Vietnamese Speech Therapy Platform',
      status: 'running',
      environment: env.NODE_ENV,
      endpoints: {
        health: '/health',
        auth: '/api/users/register, /api/users/login',
        chat: '/api/chat/messages',
        audio: '/api/audio/upload',
        assessments: '/api/assessments/start',
        practice: '/api/practice/sessions',
        experts: '/api/experts',
        notifications: '/api/notifications'
      },
      documentation: 'https://github.com/your-repo/goodviet',
      frontend: 'https://glkh-good-viet.vercel.app'
    });
  });

  // API routes
  app.use('/api/users', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/audio', audioRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/practice', practiceRoutes);
  app.use('/api/experts', expertRoutes);
  app.use('/api/expert-connections', expertConnectionRoutes);
  app.use('/api/expert-sessions', expertSessionRoutes);
  app.use('/api/notifications', notificationRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
