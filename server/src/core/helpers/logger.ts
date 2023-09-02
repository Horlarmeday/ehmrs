import chalk from 'chalk';

const log = console.log;
const currentDate = new Date().toISOString();

const error = (message: string, args?: any) =>
  log(
    chalk.bold.red(
      `${currentDate} [ERROR]: ${message}`,
      ` ${args ? JSON.stringify({ ...args }) : ''}`
    )
  );

const info = (message: string, args?: any) =>
  log(
    chalk.bold.blue(
      `${currentDate} [INFO]: ${message}`,
      ` ${args ? JSON.stringify({ ...args }) : ''}`
    )
  );

const warning = (message: string, args?: any) =>
  log(
    chalk.bold.yellow(
      `${currentDate} [WARN]: ${message}`,
      ` ${args ? JSON.stringify({ ...args }) : ''}`
    )
  );

const notice = (message: string, args?: any) =>
  log(
    chalk.bold.green(
      `${currentDate} [NOTICE]: ${message}`,
      ` ${args ? JSON.stringify({ ...args }) : ''}`
    )
  );

type Message = (message: string) => string;
type TaggedMessage = (tag: string) => Message;
export const taggedMessaged: TaggedMessage = (tag: string) => (message: string) =>
  `[${tag}] - ${message}`;
export const logger = {
  error: error,
  info: info,
  warning: warning,
  notice: notice,
};
