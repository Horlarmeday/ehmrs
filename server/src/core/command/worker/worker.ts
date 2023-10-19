import { CronTimer, ImmediateJob } from '../index';
import { Agenda } from '@hokify/agenda';

export const CronJobs = (agenda: Agenda) => {
  Object.keys(CronTimer).map(async job => {
    await agenda.every(CronTimer[job], job);
  });
};

export const InstantJobs = (agenda: Agenda) => {
  Object.keys(ImmediateJob).map(async job => {
    await agenda.now(job);
  });
};
