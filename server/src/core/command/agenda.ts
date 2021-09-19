import Agenda from 'agenda';
import Jobs from './jobs';

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

agenda.start().then(r => console.log(r));

export default agenda;