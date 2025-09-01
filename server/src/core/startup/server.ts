import '../config/env';
import express from 'express';
import routes from './routes';
// import error from '../middleware/error';
import loaders from './loaders';
// import { initSystemSettings } from '../../database/config/init-systemSettings';

// initSystemSettings();
const server: express.Application = express();

// Initialize server with async loaders
(async () => {
  try {
    await loaders(server, express);
    routes(server);
    console.log('✅ Server startup sequence completed successfully');
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();

//server.use(error);

export default server;
