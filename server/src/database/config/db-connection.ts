import { logger } from '../../core/helpers/logger';
import sequelizeConnection from './data-source';

const env = process.env.NODE_ENV || 'development';

// sequelizeConnection
//   .sync({})
//   .then(r => {
//     console.log('All models created!.');
//   })
//   .catch(err => console.error('Error occurred syncing models:', err));

try {
  sequelizeConnection
    .authenticate()
    .then(() => {
      logger.notice(`Connection has been established successfully, <${env}>`);
    })
    .catch(err => {
      logger.error('Unable to connect to the database:', err);
    });
} catch (error) {
  logger.error('Error connecting to the database:', error);
  process.exit(1);
}
