import { createClient } from 'redis';
import { logger } from '../../core/helpers/logger';

const client = createClient({
  socket: {
    reconnectStrategy: function(retries) {
      if (retries > 20) {
        logger.error('Too many attempts to reconnect. Redis connection was terminated');
        return new Error('Too many retries.');
      } else {
        return retries * 500;
      }
    },
    connectTimeout: 10000,
  },
});
client.on('connect', () => logger.notice(`Redis connection established now`));
client.on('error', error => logger.error('Redis client error:', error));

export default client;
