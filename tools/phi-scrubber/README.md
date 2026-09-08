# PHI scrubber (ADR-0005)

Deterministic scrubber for the fixture pipeline: given raw traffic captures
(HAR / JSON) from the **local dev stack only**, emit scrubbed fixtures that are
safe to commit. Real identifiers are replaced with **stable pseudonyms**
(same real value → same fake value, every run and across files), so relational
integrity across fixtures survives and contract tests stay meaningful.

## The raw-never-committed rule

- Raw captures are **never committed**. They live outside the repo in
  `~/.ehmrs/raw-captures/` and are **deleted after successful scrubbing**.
- The pseudonym map (`~/.ehmrs/scrubber-map.json`) is itself PHI — it maps real
  values to fakes — and must never enter the repository.
- The scrubber **refuses to run** if the raw directory or map path resolves
  inside the git worktree.
- Derived types (ADR-0004) are generated from scrubbed fixtures only.

## Usage

```bash
cd tools/phi-scrubber
npm install
npm run build

# Scrub all .har/.json files in ~/.ehmrs/raw-captures/ into ./scrubbed-fixtures/
node dist/cli.js

# Explicit paths
node dist/cli.js ~/captures/my-session --out ../../client-vue3/fixtures/api --map ~/.ehmrs/scrubber-map.json

# Keep raw files (dev only; raw files are otherwise deleted after success)
node dist/cli.js --keep-raw
```

Reuse the **same map file** for every capture session — that is what keeps
pseudonyms stable across runs and files.

## What gets scrubbed

| Kind | Field names (examples) | Fake shape |
|------|------------------------|------------|
| personName | `firstName`, `patientName`, `fullName`, … | pool-generated names |
| phone | `phone`, `mobile`, `msisdn`, … | `+1 555-01XXXX` (won't re-match NG patterns → idempotent) |
| nationalId | `nin`, `bvn`, `ssn`, `nationalId` | `FAKEXXXXXXXX` |
| email | any `email` field, embedded emails in text | `…@example.org` |
| mrn / patient / visit ids | `mrn`, `hospitalNumber`, `patientId`, `visitNo`, … | `MRNXXXXXXXX` (stable → joins preserved) |
| address | `address`, `street`, `lga` | generated address |
| dob | `dob`, `dateOfBirth`, … | deterministically shifted date |
| token | `token`, `authorization`, `jwt`, `api_key`, embedded JWTs (`eyJ…`) | `FAKETOKEN.…` (stable → response/state contracts stay meaningful) |
| password | `password`, `passphrase`, `secret`, `pin` | `FakePass_XXXXXXXX` |
| username | `username`, `login`, `staff_id` | `staff.xxxxxxxx` |

Empty/whitespace values are never mapped (they carry no identity and would
otherwise corrupt free-text substitution).

Free-text fields are scanned for embedded phones/emails, and any real value
already present in the pseudonym map (e.g. a patient name mapped from a
structured field) is substituted with its stable pseudonym.

## Spot-check (acceptance criterion)

Capture a session containing a handful of values you know are real in the dev
copy, then run with `--keep-raw` and grep the fixture:

```bash
grep -r "<known real value>" scrubbed-fixtures/   # must return nothing
```

The pseudonym map at `~/.ehmrs/scrubber-map.json` lets you verify each
real → fake mapping by eye.

## Development

```bash
npm test        # vitest (known values, nested clinical JSON, idempotence, stability)
npm run build   # tsc → dist/
```
