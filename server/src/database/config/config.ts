import { Sequelize } from 'sequelize-typescript';
import DBConfig from './db-config';
import * as models from '../models';
import { logger } from '../../core/helpers/logger';

const env = process.env.NODE_ENV || 'development';
const { host, dialect, password, username, database, port } = DBConfig[env];
const sequelizeConnection = new Sequelize(database, username, password, {
  port,
  host,
  dialect,
  models: Object.values(models),
  pool: { max: 50, min: 0, acquire: 30000, idle: 300000 },
  modelMatch: (filename, member) => {
    return /^(?!.*(?:index)).*\.ts$/.test(filename);
  },
});

// sequelizeConnection
//   .sync({})
//   .then(r => {
//     console.log('All models created!.');
//   })
//   .catch(err => console.error('Error occurred syncing models:', err));

sequelizeConnection
  .authenticate()
  .then(() => {
    logger.notice(`Connection has been established successfully, <${env}>`);
  })
  .catch(err => {
    logger.error('Unable to connect to the database:', err);
  });
export default sequelizeConnection;
