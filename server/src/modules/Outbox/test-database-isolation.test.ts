import '../../core/config/env';
import { Agenda } from '@hokify/agenda';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { drainOutbox } from '../../core/command/jobs/cron/drainOutbox.job';
import { JobSchedule } from '../../core/command/worker/schedule';
import { httpPoster, usesTestDatabase } from './drainer';

/**
 * #101: a Jest process started the job scheduler on import, drained the test outbox on its cron
 * tick, and delivered fixtures to a real Accounting inbox using the URL and key from `.env`.
 */

const ORIGINAL_ENV = { ...process.env };
const INBOX = 'http://127.0.0.1:1/integration/emr/events';

let fetchSpy: jest.SpyInstance;

beforeEach(() => {
  fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 202 }));
});

afterEach(() => {
  jest.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

afterAll(async () => {
  await sequelizeConnection.close();
});

describe('the job scheduler in a test process', () => {
  it('never starts when a test imports application code', () => {
    let started = 0;

    jest.isolateModules(() => {
      // The isolated registry has its own Agenda class, so the spy must be taken on that one.
      jest
        .spyOn(jest.requireActual('@hokify/agenda').Agenda.prototype, 'start')
        .mockImplementation(async () => {
          started += 1;
        });
      require('../../database/config/data-source');
      require('../../core/command/agenda');
    });

    expect(started).toBe(0);
  });

  it('has no job store, so a scheduled job is dropped rather than queued', async () => {
    const schedule = jest.spyOn(Agenda.prototype, 'schedule');

    await JobSchedule.assignHospitalNumber(1);

    expect(schedule).not.toHaveBeenCalled();
  });
});

describe('delivering from the test database', () => {
  it('refuses under Jest without calling the inbox', async () => {
    await expect(httpPoster(INBOX, '{}', {})).rejects.toThrow('test database');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refuses a non-test NODE_ENV that is connected to the test database', async () => {
    process.env.NODE_ENV = 'production';
    process.env.TEST_DB_NAME = String(sequelizeConnection.config.database);

    await expect(httpPoster(INBOX, '{}', {})).rejects.toThrow('test database');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('leaves unsent rows untouched when the drain job fires with the outbox enabled', async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    const claim = jest.spyOn(OutboxEvent, 'findAll');

    await drainOutbox();

    expect(claim).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('delivering from any other database', () => {
  it('still posts to the inbox', async () => {
    process.env.NODE_ENV = 'production';
    process.env.TEST_DB_NAME = 'some_other_database';

    expect(usesTestDatabase()).toBe(false);
    await expect(httpPoster(INBOX, '{}', {})).resolves.toEqual({ status: 202 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
