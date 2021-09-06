import '../config/env';
import express from 'express';
import routes from './routes';
import error from '../middleware/error';
import './logger';
import loaders from './loaders';

const server: express.Application = express();
loaders(server, express);
routes(server);

server.use(error);

export default server;
