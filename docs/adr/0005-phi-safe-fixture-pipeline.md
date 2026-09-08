# PHI-safe fixture pipeline: deterministic scrubbing before anything reaches git

Constraint discovered during migration planning: EHMRS is live in a hospital; the dev
database is mostly a **copy of production data** (real patient PHI) plus some demo data.
Phase 1's fixture capture — now load-bearing for both contract tests and API type
derivation (ADR 0004) — would therefore capture real PHI if left ungoverned.

Decision:

- **Capture source is the local dev stack only** (docker-compose: MySQL/Mongo copy + api +
  client). Production is never instrumented for capture.
- A **deterministic scrubber** is a Phase 1 deliverable that runs before any fixture is
  written to disk: real identifiers are replaced with **stable pseudonyms** (same real
  value → same fake value, every run), so relational integrity across fixtures survives
  (patient X's ID, name, phone, NIN etc. are consistently mapped) and contract tests
  remain meaningful.
- Scrubbing is structural, not just field-name-based: it walks nested clinical JSON
  (visits → lab results → prescriptions), string fields, and anything matching identifier
  patterns (names, phones, national IDs, dates of birth become shifted dates).
- **Raw captures (HAR/MSW logs) are never committed** — only scrubbed fixtures. Raw files
  live outside the repo in an ignored directory and are deleted after scrubbing.
- Derived types are generated from scrubbed fixtures only.

## Consequences

- The scrubber must be built and verified (spot-check against known real values) before
  bulk capture begins — it gates Phase 1.
- Stable pseudonym mapping table stays out of git (it is itself PHI).
- Live-deployment status also activates the plan's Phase 1b (parallel serving, Sentry on
  both apps, rollback window): with real hospital users, the strangler cutover discipline
  is necessary, not optional.
