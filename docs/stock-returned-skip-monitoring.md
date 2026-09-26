# Monitoring `stock.returned` skips (#21, #22, #70)

Status: DRAFT — thresholds pending review against observed rates.

## What the skip is

When stock moves on a return but no `stock.returned` event can be emitted, the producer logs a
`warn` and the stock event is skipped — deliberately, not as an error:

- `missing_batch_id` — the source `pharmacy_store` row carries no `external_batch_id` (legacy
  rows predating the #297 applier; `pharmacy_store_id` is permanently nullable, #295 D3).
- `missing_item_code` — the drug carries no catalogue `code`.

Emission cannot proceed because `buildStockReturnedEvent` throws on an empty batch id and
fabricating one is forbidden (#295 D3). The refund half is unaffected — `charge.returned` (EMR #32)
is emitted outside the batch guard, so the patient is still recorded as owed (ACCT #174). The
consequence is inventory-accuracy only: Accounting's per-location stock split under-counts the
returned units until the next `stock.counted` (ACCT #28) corrects it.

## Where the signals land

- Per-skip line: `[stock.returned] - not emitted for a <source> return: ... [reason=... ids...]`
  at `warn` — visible on the container console **and** in `logs/warn-YYYY-MM-DD.log`
  (14-day rotation, 20m per file).
- Hourly summary: `[stock.returned] - skip summary for the last hour: source=... reason=... count=...`
  emitted only in hours where at least one skip occurred (per API replica; prod runs 5).
- Receiving-end record of the same skip: ADR-0040 §"A Flow 1 return with no resolvable batch id"
  (ACCT #174).

## Investigating

```bash
# all skips today, by class
grep '\[stock.returned\]' logs/warn-$(date +%F).log | grep -c 'not emitted'

# grouped by reason
grep -o 'reason=[a-z_]*' logs/warn-*.log | sort | uniq -c

# one location's skips
grep '\[stock.returned\]' logs/warn-*.log | grep 'pharmacy_store_id=<id>'
```

Follow the ids in the line (`return_id`, `drug_id`, `pharmacy_store_id`, `inventory_item_id`) —
ids only, never demographics (ADR-0016 applies to logs).

## Thresholds (DRAFT)

| Signal | Interpretation | Action |
|---|---|---|
| 0 skips in a day | Normal — target state | None |
| 1–5 `missing_batch_id`/day | Legacy rows still draining | Watch the trend; should decay toward 0 as rows are touched/applied |
| Sustained >5/day `missing_batch_id`, flat for a week | The #297 applier is not reaching those rows or new legacy rows are being created | Investigate: list `pharmacy_store` rows with NULL `external_batch_id`, correlate with the skipped `pharmacy_store_id`s |
| Any `missing_item_code` | A dispensed drug has no catalogue `code` | Per-drug data fix — catalogue the drug (cf. tasks/83); each occurrence is a concrete inventory blind spot |

An hourly summary line appearing at all is already worth a glance; a summary with a count that
grows hour over hour is an active investigation trigger.
