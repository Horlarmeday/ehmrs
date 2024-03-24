import { Agenda } from '@hokify/agenda';
import Jobs from './worker/jobDefinition';
import { CronJobs } from './worker/worker';
import { logger } from '../helpers/logger';

if (!process.env.DB_MONGO) throw new Error('Cannot find Mongo url');

const agenda = new Agenda({
  db: {
    address: process.env.DB_MONGO,
    collection: 'ehmrs_jobs',
  },
  ensureIndex: true,
});

agenda.on('success', async job => {
  if (!job.attrs.repeatAt && !job.attrs.nextRunAt) {
    await job.remove();
    logger.notice(`${job.attrs.name} was successful, deleting ${job.attrs.name} job...`);
  }
});

agenda
  .on('ready', () => console.log('Agenda started!'))
  .on('error', () => console.log('Agenda connection error!'));

Jobs(agenda);

agenda.start().then(() => {
  //InstantJobs(agenda);
  CronJobs(agenda);
});

export default agenda;
