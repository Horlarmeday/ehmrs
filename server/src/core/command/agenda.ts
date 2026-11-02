import { Agenda } from '@hokify/agenda';
import Jobs from './worker/jobDefinition';
import { CronJobs, InstantJobs } from './worker/worker';
import { logger } from '../helpers/logger';

if (!process.env.DB_MONGO) throw new Error('Cannot find Mongo url');

/**
 * Importing this module starts the scheduler, and application code imports it transitively. Under
 * Jest that ran the outbox drain against the test database and delivered fixtures to a real
 * Accounting inbox (#101), so a test process never connects or starts.
 */
const isTestProcess = process.env.NODE_ENV === 'test';

const agenda = new Agenda(
  isTestProcess
    ? {}
    : {
        db: {
          address: process.env.DB_MONGO,
          collection: 'ehmrs_jobs',
        },
        ensureIndex: true,
      }
);

agenda.on('success', async job => {
  if (!job.attrs.repeatAt && !job.attrs.nextRunAt) {
    await job.remove();
    logger.notice(`${job.attrs.name} was successful, deleting ${job.attrs.name} job...`);
  }
});

agenda
  .on('ready', () => console.log('Agenda started!'))
  .on('error', () => console.log('Agenda connection error!'));

if (!isTestProcess) {
  Jobs(agenda);

  agenda.start().then(() => {
    InstantJobs(agenda);
    CronJobs(agenda);
  });
}

export default agenda;
