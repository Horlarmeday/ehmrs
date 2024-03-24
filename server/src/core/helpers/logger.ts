import chalk from 'chalk';

export type Message = (message: string) => string;
export type TaggedMessage = (tag: string) => Message;
export const taggedMessaged: TaggedMessage = (tag: string) => (message: string) =>
  `[${tag}] - ${message}`;

const log = console.log;
const currentDate = new Date().toISOString();

const error = (message: string, args?: any) =>
  log(
    chalk.bold.red(
      `${currentDate} [ERROR]: ${message}`,
      ` ${args ? JSON.stringify({ ...args }) || '' : ''}`
    )
  );

const info = (message: string, args?: any) =>
  log(
    chalk.bold.blue(
      `${currentDate} [INFO]: ${message}`,
      ` ${args ? JSON.stringify({ ...args }) || '' : ''}`
    )
  );

const warning = (message: string, args?: any) =>
  log(
    chalk.bold.yellow(
      `${currentDate} [WARN]: ${message}`,
      ` ${args ? JSON.stringify({ ...args }) || '' : ''}`
    )
  );

const notice = (message: string, args?: any) =>
  log(
    chalk.bold.green(
      `${currentDate} [NOTICE]: ${message}`,
      ` ${args ? JSON.stringify({ ...args }) || '' : ''}`
    )
  );

export const logger = {
  error,
  info,
  warning,
  notice,
};
