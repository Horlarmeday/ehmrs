import { Sequelize } from 'sequelize-typescript';
import DBConfig from './db-config';
import * as models from '../models';

const env = process.env.NODE_ENV || 'development';
const { host, dialect, password, username, database, port } = DBConfig[env];
export const sequelizeConnection = new Sequelize(database, username, password, {
  port,
  host,
  dialect,
  models: Object.values(models),
  pool: { max: 50, min: 0, acquire: 30000, idle: 300000 },
  modelMatch: (filename, member) => {
    return /^(?!.*(?:index)).*\.ts$/.test(filename);
  },
});
