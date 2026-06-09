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
        connectSrc: ["'self'", env.CORS_ORIGIN],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // CORS configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
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

  // API routes
  app.use('/api/users', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/audio', audioRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/practice', practiceRoutes);
  app.use('/api/experts', expertRoutes);
  app.use('/api/notifications', notificationRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
