import server from './core/startup/server';
import { logger } from './core/helpers/logger';

server.listen(process.env.PORT, () => logger.notice(`Running on port ${process.env.PORT}...`));
