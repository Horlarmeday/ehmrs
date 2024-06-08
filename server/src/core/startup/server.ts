import '../config/env';
import express from 'express';
import routes from './routes';
// import error from '../middleware/error';
import loaders from './loaders';
import { initSystemSettings } from '../../database/config/init-systemSettings';

initSystemSettings();
const server: express.Application = express();
loaders(server, express);
routes(server);
//server.use(error);

export default server;
