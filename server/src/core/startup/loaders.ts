import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import Agendash from 'agendash2';
import morgan from 'morgan';
import agenda from '../command/agenda';

export default (server, express) => {
  server.use(helmet());
  server.use(cors({ credentials: true, origin: [], optionsSuccessStatus: 200 }));
  server.use(morgan('dev'));
  server.use(
    fileUpload({
      limits: { fileSize: 7 * 1024 * 1024 },
    })
  );
  server.use(express.json({ limit: '5mb' }));
  server.use(express.static('download'));
  server.use('/static', express.static(path.join(__dirname, '../public')));
  server.use('/dash', Agendash(agenda));
};
