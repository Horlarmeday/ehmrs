import Agenda from 'agenda';
import Jobs from './worker/jobDefinition';
import { CronJob, JobNow } from './worker/worker';

const agenda = new Agenda({
  db: { address: process.env.DB_MONGO, collection: 'ehmrs_jobs' },
  options: {
    autoIndex: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
});

agenda
  .on('ready', () => console.log('Agenda started!'))
  .on('error', () => console.log('Agenda connection error!'));

Jobs(agenda);

agenda.start().then(() => {
  //JobNow(agenda);
  CronJob(agenda);
});

export default agenda;
