import winston from 'winston';

const { format } = winston;
const { combine, timestamp, prettyPrint, colorize, printf, errors } = format;

const myFormat = printf(({ level, message, label, time }) => {
  return `${time} [${label}] ${level}: ${message}`;
});
const tsFormat = 'YYYY-MM-DD HH:mm:ss';

class Logger {
  constructor() {
    winston.add(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: combine(timestamp(), prettyPrint(), colorize(), myFormat),
      })
    );

    winston.add(
      new winston.transports.Console({
        format: combine(
          errors({ stack: true }),
          colorize(),
          timestamp({ format: tsFormat }), // I think this does not do anything
          printf(info => {
            const splatSymbol = (Symbol.for('splat') as unknown) as string;
            const log = `${info.timestamp} ${info.level}: ${info.message}${
              info[splatSymbol] !== undefined ? `${info[splatSymbol]}` : ' '
            }`;
            return info.stack ? `${log}\n${info.stack}` : log;
          })
        ),
        handleExceptions: true,
      })
    );

    winston.add(
      new winston.transports.File({
        filename: './logs/combined.log',
        format: combine(timestamp(), prettyPrint(), myFormat),
      })
    );

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
