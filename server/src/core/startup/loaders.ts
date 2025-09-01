import path from 'path';
import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import Agendash from 'agendash';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { RequestHandler } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import agenda from '../command/agenda';
// import serveStatic from 'serve-static';
import { AccountingStartupService } from '../../modules/Accounting/services/startup.service';

export default async (
  server: express.Application,
  express: {
    static: (
      arg0: string
    ) => RequestHandler<Record<string, unknown>, any, any, ParsedQs, Record<string, any>>;
  }
) => {
  server.use(helmet());
  server.use(cors({ credentials: true, origin: [], optionsSuccessStatus: 200 }));
  server.use(morgan('dev'));
  server.use(bodyParser.json({ limit: '50mb' }));
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(express.static('download'));
  // server.use(serveStatic(path.join(__dirname, '../../../../client/dist')));
  server.use('/static', express.static(path.join(__dirname, '../../public')));
  
  // Initialize accounting system after middleware setup
  try {
    console.log('🚀 Initializing Accounting System...');
    await AccountingStartupService.initialize();
    console.log('✅ Accounting system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize accounting system:', error);
    // Continue server startup but log the error
    console.warn('⚠️  Server will continue without accounting system initialization');
  }
  
  server.use('/dash', () => {
    agenda.on('ready', () => {
      Agendash(agenda);
    });
  });
};
