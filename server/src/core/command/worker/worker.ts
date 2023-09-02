import { CronTimer, ImmediateJob } from '../index';

export const CronJob = agenda => {
  Object.keys(CronTimer).map(async job => {
    await agenda.every(CronTimer[job], job);
  });
};

export const JobNow = agenda => {
  Object.keys(ImmediateJob).map(async job => {
    await agenda.now(job);
  });
};
