import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start listening
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
}

// Start the server
startServer();
