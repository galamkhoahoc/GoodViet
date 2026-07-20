import { createApp, ensureDb } from './app';
import { env } from './config/env';

/**
 * Express app instance.
 * On Vercel the default export is used as the serverless handler.
 * Locally we call app.listen().
 */
const app = createApp();

// --- Local development: start listening ---
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

if (!IS_VERCEL) {
  (async () => {
    try {
      await ensureDb();
      app.listen(env.PORT, () => {
        console.log(`🚀 Server running on port ${env.PORT}`);
        console.log(`📍 Environment: ${env.NODE_ENV}`);
        console.log(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
        console.log(`\n✨ Backend is ready!`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  })();
}

// --- Vercel serverless: export the app as default ---
export default app;
