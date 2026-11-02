# #101 EMR test events reached a real Accounting inbox

## Route found

Application code imports `core/command/worker/schedule.ts`, which imports `core/command/agenda.ts`,
which starts Agenda on import. So any Jest process reaching that chain ran the recurring
`Drain EMR-Accounting outbox` job with `NODE_ENV=test`: it read `ehmrs_test`, and took the real inbox
URL and signing key from `.env`.

It delivers only when the test process wins the job lock in the shared Mongo job store. The dev
server usually wins. It was down at the 2026-11-01 19:24 tick (nodemon restarted at 19:26), which
fits the 19:24:08 receipt and the 19:25:00 `getConnection ... after the connection manager was
closed` drain error in `logs/error-2026-11-01.log`.

## Tasks

- [x] Reproduce: Jest process, capture server as inbox, throwaway Mongo database
- [x] Agenda neither connects nor starts in a test process; `JobSchedule` is a no-op there
- [x] `httpPoster` refuses under Jest or when connected to `TEST_DB_NAME`
- [x] Drain job skips the test database, so rows do not burn attempts
- [x] Test proving all of the above, each guard checked by removing it

## Review

**Changes:** `core/command/agenda.ts`, `core/command/worker/schedule.ts`,
`modules/Outbox/drainer.ts`, `core/command/jobs/cron/drainOutbox.job.ts`, and
`modules/Outbox/test-database-isolation.test.ts`.

**Decisions:** two layers, because the scheduler guard closes this route and the poster guard closes
any other, such as a dev server pointed at `ehmrs_test`. `httpGatePoster` is unguarded: it asks
Accounting a question and writes nothing there.

**Evidence:** before the fix, a held Jest process delivered 1 event to the capture server at the
cron tick. After it, with a fresh unsent row and the same setup: no Agenda start, 0 captured, row
untouched. `src/modules/Outbox/`: 13 failed before and after, the same tests, in `payer-channels`
and `emit-for-rows`; the 6 added tests pass.

**Limitation:** tests no longer schedule jobs, so a test asserting a job really runs would need its
own Agenda.
