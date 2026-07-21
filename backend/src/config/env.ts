import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // Server
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  API_BASE_URL: z.string()
    .url()
    .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
      message: 'API_BASE_URL must use http:// or https://',
    })
    .transform((value) => value.replace(/\/+$/, ''))
    .optional(),
  
  // Database
  MONGODB_URI: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Optional - AWS S3 (will be used later)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  
  // Optional - Gemini API (will be used later)
  GEMINI_API_KEY: z.string().optional(),
  XAH_API_KEY: z.string().optional(),
  
  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
}).superRefine((config, context) => {
  if (['staging', 'production'].includes(config.NODE_ENV) && !config.API_BASE_URL) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['API_BASE_URL'],
      message: 'API_BASE_URL is required outside development/test for signed audio URLs',
    });
  }
  if (
    config.NODE_ENV === 'production'
    && config.API_BASE_URL
    && new URL(config.API_BASE_URL).protocol !== 'https:'
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['API_BASE_URL'],
      message: 'API_BASE_URL must use HTTPS in production',
    });
  }
});

/**
 * Validate and export environment variables
 */
export const env = envSchema.parse(process.env);

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';
