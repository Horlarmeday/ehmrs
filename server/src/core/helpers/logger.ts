import * as winston from 'winston';
import 'winston-daily-rotate-file';

export type Message = (message: string) => string;
export type TaggedMessage = (tag: string) => Message;
export const taggedMessaged: TaggedMessage = (tag: string) => (message: string) =>
  `[${tag}] - ${message}`;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  notice: 3,
  http: 4,
  debug: 5,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  notice: 'green',
  http: 'white',
  debug: 'magenta',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxFiles: '14d',
    level: 'error',
    maxSize: '20m',
  }),
];

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/exception-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
      level: 'error',
      maxSize: '20m',
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
      level: 'error',
      maxSize: '20m',
    }),
  ],
});
