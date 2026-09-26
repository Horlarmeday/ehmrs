# Task 83 — Give investigations a catalogue code and emit it on charge.captured

Issue: Horlarmeday/ehmrs#83 · Parent: ehmrs_accounting#394 · Slice C2

## Decisions (confirmed with owner, 2026-09-26)

- Codes are **server-generated only** (`INV-####`); the client cannot create or edit them. Any `code` in a request body is ignored/stripped.
- `code` is **required** on the model (consistent with Test/Service) and **unique at DB level** (unique index).
- Backfill scheme: `INV-0001`, `INV-0002`, ... by ascending `id` (zero-padded to 4 digits; unpadded beyond 9999 while staying ≤ 43 chars).
- `code` is not accepted from clients; server generates 1–43 char codes.
- Test-schema snapshot regeneration was approved, **but reverted during verification** (see Review).

## Implementation

- [x] `server/src/database/models/investigation.ts` — `code`: STRING(43), NOT NULL, unique, `notEmpty` validate (`code is required`).
- [x] `server/src/database/migrations/20260926000000-add-code-to-investigations.js` — add nullable column (after `name`) → backfill `INV-####` via `ROW_NUMBER() OVER (ORDER BY id)` join-update → NOT NULL → unique index `uniq_investigations_code`. `down` drops both.
- [x] `radiology.repository.ts` — `nextInvestigationCode()` picks `MAX(CAST(SUBSTRING(code,5) AS UNSIGNED))` over `INV-<digits>` codes; `createInvestigation` retries (bounded, 5) on unique-violation race. Client-supplied `code` is never read.
- [x] `updateInvestigation` — strips `code` before `investigation.update`, so the API cannot mutate codes.
- [x] `outbox-writer.ts` — removed the `type !== 'investigation'` guard in `catalogueFieldsFromEntity`; investigations now emit `item_code` identically to the other four types, falling back to `service_line`-only when a row has no code.
- [x] `radiology/validations.ts` — `validateInvestigation` now validates with `stripUnknown: true`.
- [x] Tests — `emit-for-rows.test.ts`: investigation now seeded with `code: 'CXR'`; new/updated assertions that a captured investigation charge carries `item_code: 'CXR'` + `service_line: 'Chest X-Ray'`; name-only fallback test now mocks `Investigation.findOne` (a codeless row can no longer exist in the DB). `payer-channels.test.ts` seeds `code: 'CHAN-INV'`.

## Review

### Summary
Investigations now carry a server-owned unique catalogue code. The backfill assigned `INV-0001`–`INV-0145` on the dev DB (145 rows, 145 distinct codes, verified by query). `charge.captured` payloads for investigation lines now include `item_code`, making `item:investigation:<code>` tariff rules possible in Accounting.

### Deviations from plan
- **Snapshot regeneration reverted.** Regenerating `schema.sql` from the live dev DB (`ehmrs_caroline`) pulled in unrelated drift (188→194 tables, `pssh_price`, enum changes, etc.) that breaks ~93 tests that expect the committed snapshot's shape. Also the dev DB was missing the 2026 outbox/inbox tables (its `SequelizeMeta` was behind), which first required applying those migrations manually. Instead the committed snapshot was left untouched: the integration DB receives the `code` column through the normal post-snapshot migration mechanism (`setup-test-db.js` applies migrations newer than `20230606`). Bringing the dev DBs into sync and refreshing the snapshot is a separate task; do NOT regenerate the snapshot until then.

### Impact
- Existing API consumers are unaffected: `code` is ignored on create, stripped on update, and never required in any request body.
- The unique index is a deliberate improvement over Test/Service (app-level only); a duplicate-code insert now fails loudly.
- Old investigations all have codes after the migration, so every charge line can price per item.

### Testing evidence
- `npx tsc --noEmit` — clean.
- Migration applied to dev DB: 145 investigations, all codes non-empty and unique (`INV-0001`…`INV-0145` by `id`).
- Fresh `yarn test:db:setup` + full `yarn test`: **93 failed / 475 passed — byte-identical failure set to the pre-change baseline** (pre-existing suite-wide issues: stale compiled `dist/` suites, `Visit.category` NOT NULL drift, etc.). Zero regressions.
- `emit-for-rows.test.ts`: 29/29 pass, including `emits item_code from the investigation catalogue code` and the name-only fallback.
- `payer-channels.test.ts`: 12/12 pass.

### Limitations / future considerations
- `Test` and `Service` codes are still not DB-unique (out of scope).
- Snapshot regeneration blocked on dev-DB/outbox sync (documented above).
- The generation query is MySQL-specific (`REGEXP`, `CAST ... AS UNSIGNED`) — fine for this stack.

## Out of scope
- Vue2 client form changes (code is server-managed only).
- Seeding/repricing accounting tariff rules (accounting repo's concern).
