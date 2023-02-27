import { Sequelize } from 'sequelize-typescript';
import DBConfig from './db-config';
import * as models from '../models';

const env = process.env.NODE_ENV || 'development';
const { host, dialect, password, username, database } = DBConfig[env];

const sequelizeConnection = new Sequelize(database, username, password, {
  host,
  dialect,
  models: Object.values(models),
  modelMatch: (filename, member) => {
    return /^(?!.*(?:index)).*\.ts$/.test(filename);
  },
});
// sequelizeConnection
//   .sync({ force: true })
//   .then(r => {
//     console.log('All models created!.');
//   }).catch(err => console.error('Error occurred syncing models:', err))

sequelizeConnection
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
export default sequelizeConnection;
