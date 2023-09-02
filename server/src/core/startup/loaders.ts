import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import Agendash from 'agendash2';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import agenda from '../command/agenda';

export default (server, express) => {
  server.use(helmet());
  server.use(cors({ credentials: true, origin: [], optionsSuccessStatus: 200 }));
  server.use(morgan('dev'));
  server.use(bodyParser.json({ limit: '50mb' }));
  // server.use(express.json({ limit: '5mb' }));
  server.use(express.static('download'));
  server.use('/static', express.static(path.join(__dirname, '../../public')));
  server.use('/dash', Agendash(agenda));
};
