import winston from 'winston';

const { format } = winston;
const { combine, timestamp, prettyPrint, colorize, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

class Logger {
  constructor() {
    winston.loggers.add('category 1', {
      format: combine(timestamp(), prettyPrint(), colorize(), myFormat),
      transports: [
        new winston.transports.File({ filename: 'logs/error.log' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
    // winston.add(
    //   new winston.transports.File({
    //     filename: 'logs/error.log',
    //     level: 'error',
    //     format: combine(timestamp(), prettyPrint(), colorize(), myFormat),
    //   })
    // );
    //
    // winston.add(
    //   new winston.transports.File({
    //     filename: './logs/combined.log',
    //     format: combine(timestamp(), prettyPrint(), myFormat),
    //   })
    // );

    winston.exceptions.handle(
      new winston.transports.File({
        filename: 'logs/exceptions.log',
        format: combine(timestamp(), prettyPrint(), colorize(), myFormat),
      })
    );

    process.on('unhandledRejection', ex => {
      throw ex;
    });
  }
}

export default new Logger();
