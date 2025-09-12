import server from './core/startup/server';
import { logger } from './core/helpers/logger';

// Add error handlers for unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // process.exit(1); // Commented out to see the actual error
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // process.exit(1); // Commented out to see the actual error
});

try {
  server.listen(process.env.PORT, () => {
    logger.notice(`Running on port ${process.env.PORT}...`);
  });
} catch (error) {
  logger.error('Error starting server:', error);
  // process.exit(1); // Commented out to see the actual error
}
