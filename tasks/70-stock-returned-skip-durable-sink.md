# #70 — `stock.returned` skip warnings: durable sink + rate observability

Issue: https://github.com/…/issues/70 — the skip made observable by #21/#22 is not *observed*: `warn` reaches only the console, Docker's json-file driver is unbounded, and nobody can answer "how often does this fire?". Ops/config scope; **`skip-observability.ts` must not change** (frozen — correct and tested).

Decisions confirmed with Mahmud:
- Separate `DailyRotateFile` at `level: 'warn'` (`logs/warn-%DATE%.log`), same 14d/20m rotation as errors.
- In-process counter by `source` × `reason` with a periodic summary `warn` (per-replica is acceptable; no Redis machinery).
- Threshold note: I draft, Mahmud approves; lives under `docs/`.
- Docker `logging:` block on `docker-compose.prod.yml` only.
- Verification: typecheck + manual smoke (no new jest tests).

## Todos

- [x] **T1 — Warn file sink** (low)
  - `server/src/core/helpers/logger.ts`: add a `DailyRotateFile` transport to `transports` — `filename: 'logs/warn-%DATE%.log'`, `datePattern: 'YYYY-MM-DD'`, `level: 'warn'`, `maxFiles: '14d'`, `maxSize: '20m'`, `zippedArchive: true` (mirrors the error transport).
  - Existing error transport stays as-is; error lines continue to skip the warn file (winston transports are level-filtered, not exclusive).
  - Acceptance: a `logger.warn(...)` call in dev with `NODE_ENV=production` lands in `logs/warn-<date>.log`; console output unchanged.

- [x] **T2 — Skip-rate counter + periodic summary** (medium)
  - New `server/src/modules/Outbox/skip-metrics.ts`: exports `recordStockReturnedSkip(skip: StockReturnedSkip): void` — never throws (same contract as `logStockReturnedSkip`).
  - Internally: increments a module-level `Map<source, Map<reason, count>>`, calls `logStockReturnedSkip(skip)` so the per-skip line keeps its current shape and call sites stay single-call.
  - Summary: first skip starts a timer (e.g. 1h `setInterval(...).unref()`); on flush, logs a `warn` summary line tagged `stock.returned` (`skip summary: source=X reason=Y count=N ...`) and resets counters; timer cleared when a full window has zero skips.
  - `Record` types reused from `skip-observability.ts` (import only — file unchanged).
  - Acceptance: `npx tsc --noEmit` clean; summary line appears in console and `logs/warn-*.log`.

- [x] **T3 — Switch call sites to the counter** (low)
  - `server/src/modules/Inventory/inventory.repository.ts` (~L548, L550) and `server/src/modules/Pharmacy/pharmacy.repository.ts` (~L991): replace `logStockReturnedSkip(...)` with `recordStockReturnedSkip(...)` (import updated).
  - No behavioral change to the emitted per-skip line; existing 23 tests in `skip-observability.test.ts` remain green (`yarn test src/modules/Outbox/skip-observability.test.ts`).
  - Acceptance: both repos compile; tests pass untouched.

- [x] **T4 — Bound Docker prod logs** (low)
  - `docker-compose.prod.yml`, `api` service: add
    ```yaml
    logging:
      driver: json-file
      options:
        max-size: '20m'
        max-file: '5'
    ```
  - Prod only, as confirmed. No domain/config files touched otherwise.

- [x] **T5 — Threshold + monitoring note** (low)
  - New `docs/stock-returned-skip-monitoring.md`: what the skip is (link #21/#22/#70, ADR-0040 Flow-1 note), where to look (`logs/warn-*.log`, `[stock.returned]` tag), proposed thresholds — draft: **0/day is the target**; any `missing_batch_id` skip is expected to trend to zero as legacy batches drain (verify with #24's data); a sustained rate >5/day or any `missing_item_code` on a newly-catalogued drug warrants investigation; investigate = grep the warn file by `reason` + `pharmacy_store_id`, cross-check ACCT #28 correction window.
  - Marked DRAFT pending Mahmud's rate review before PR merge.

- [x] **T6 — Verify & ship** (low)
  - `npx tsc --noEmit` (server); run affected Outbox tests.
  - Manual smoke: build server with `NODE_ENV=production`, trigger a warn, confirm `logs/warn-*.log` content; `docker compose -f docker-compose.prod.yml config` to validate YAML.
  - Branch `<issue>-stock-returned-skip-sink` from `svsh_branch`, PR to `svsh_branch` via `gh pr create` (mandatory).

## Out of scope (per issue)
- Widening the emitter guard (#295 D3), backfilling `external_batch_id` (#24), refund half (EMR #32).
- No changes to `skip-observability.ts` — frozen.

## Review

### Implemented changes
- `logger.ts`: new `DailyRotateFile` transport at `level: 'warn'` → `logs/warn-%DATE%.log` (14d, 20m, zipped). Console and error transports unchanged.
- `Outbox/skip-metrics.ts` (new): `recordStockReturnedSkip` wraps the frozen `logStockReturnedSkip`, counts by `source` × `reason`, and warns an hourly summary line tagged `[stock.returned]` (only in hours with ≥1 skip; timer unref'd, stops itself after an empty window). Interval overridable via `SKIP_SUMMARY_INTERVAL_MS` (default 1h) — deliberate addition for testability, keeps the code data-driven.
- Call sites (`inventory.repository.ts` ×2, `pharmacy.repository.ts` ×1) switched to `recordStockReturnedSkip`. Per-skip line output identical; `skip-observability.ts` untouched.
- `docker-compose.prod.yml`: `logging:` block on the api service (`json-file`, 20m × 5).

### Deliberate deviations from the issue's minimal scope
- `docker-compose.prod.yml` was already an invalid compose project on `svsh_branch`: services referenced an undeclared `sail` network and a nonexistent `mongo` service (base is `mongodb` in `docker-compose.yml`). Fixed both (3-line top-level `networks:` block, `mongo` → `mongodb`) — without this the file cannot run at all and the logging block is unverifiable. `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` now validates.
- `SKIP_SUMMARY_INTERVAL_MS` env override (see above).

### Impact assessment
- No domain logic, event bodies, guards, or API surface changed. All warn/error log routing gains a durable file sink for every future `warn`, not just skips (accepted, chosen option).

### Testing evidence
- `npx tsc --noEmit` clean; eslint clean on new/changed files.
- 23/23 `skip-observability.test.ts` pass untouched.
- Smoke (NODE_ENV=production, ts-node): per-skip warn lines written to `logs/warn-2026-09-26.log` (grep count 2); hourly summary path verified with `SKIP_SUMMARY_INTERVAL_MS` — exactly one summary warn per window, present in both console and warn file; empty window stops the timer.
- Compose overlay validates; `logging:` block present only on api.

### Limitations / future considerations
- Counters are per-replica (5 in prod) — summaries under-report by at most 5×; acceptable per agreed decision.
- Thresholds in `docs/stock-returned-skip-monitoring.md` are DRAFT pending a rate review against real warn-file data.
- Summary "last hour" is fixed-window from first skip, not aligned to clock hours.
