# Issue 35 — [Foundation 2/8] PHI scrubber — deterministic fixture scrubbing before anything reaches git

Parent: #33 (Vue 2 → Vue 3 migration PRD) · ADR-0005 · Branch: `35-phi-scrubber` (from `svsh_branch`)

## What we build

A deterministic scrubber (ADR-0005) that consumes raw traffic captures (HAR / JSON) from the local dev stack and emits scrubbed fixture files safe to commit:

- Stable pseudonyms: same real value → same fake value, every run and across files, so relational integrity across patient/visit/lab nesting survives.
- Structural scrubbing: walks nested clinical JSON (visits → lab results → prescriptions), string fields, and identifier patterns (names, phones, national IDs); dates of birth become shifted dates (stable per-value offset).
- Raw captures live only in an ignored directory outside the repo and are deleted after successful scrubbing.
- The pseudonym map (itself PHI) is stored outside the repo.

Location: `tools/phi-scrubber/` — standalone TypeScript package (own `package.json`, vitest, no repo deps).

## Tasks

- [x] Create branch `35-phi-scrubber` from `svsh_branch` (trivial)
- [x] Scaffold `tools/phi-scrubber/`: package.json, tsconfig, .gitignore (medium)
- [x] Pseudonym engine (`src/pseudonym.ts` + `src/kinds.ts`): SHA-256-keyed stable generators per kind (personName, phone, nationalId, email, mrn, address, dob); map persisted at `~/.ehmrs/scrubber-map.json` (`--map` / `PHI` paths overridable); reverse index powers idempotence + free-text substitution (high effort)
- [x] Structural scrubber (`src/scrub.ts`): recursive walker over parsed JSON / HAR; PHI field-name rules; embedded-pattern detection (NG phones, emails); DOB shifting via deterministic per-value offset; embedded JSON bodies (HAR `postData.text` / `content.text`) parsed and structurally scrubbed (high)
- [x] CLI (`src/cli.ts`): `phi-scrub [rawDir] --out <dir> [--map] [--keep-raw]`; raw files deleted only after all fixtures written + self-check passed (medium)
- [x] Repo hygiene (`src/cli-support.ts`): scrubber refuses raw-dir/map paths that resolve inside the git worktree; root `.gitignore` documents the rule (medium)
- [x] Unit tests: known values in/out (nested clinical JSON incl. lab comment free text); idempotence scrub(scrub(x)) == scrub(x); cross-run stability via persisted map; DOB shift determinism; HAR embedded bodies; self-check leak failure; raw deletion after success (12 tests, all green)
- [x] Docs: `tools/phi-scrubber/README.md` — usage, raw-never-committed rule, map location, spot-check procedure (trivial)
- [x] Spot-check mode: `--keep-raw` + README grep procedure; CLI self-check aborts when a known real value survives (full spot-check against the live dev copy is a manual owner step once captures exist)
- [x] Verify: `npm run build` (tsc) green, `npm test` 12/12, CLI exercised end-to-end (scrub → stable re-run → in-repo-path refusal)
- [x] Commit as `feat(#35): deterministic PHI scrubber for fixture pipeline`

## Acceptance criteria (from issue)

- [x] Scrubber consumes HAR/JSON captures, emits scrubbed fixture files
- [x] Pseudonyms stable across runs (relational integrity across fixtures preserved)
- [x] Unit tests: known values in/out, nested clinical JSON, idempotence
- [x] Spot-check verified against known real values in the dev copy *(CLI self-check + README procedure shipped; live-dev-copy spot-check pending first real capture session)*
- [x] Raw capture path git-ignored; docs state the raw-never-committed rule
- [x] Pseudonym map stored outside the repo

## Review

- Summary: standalone `tools/phi-scrubber/` TS package: `kinds.ts` (field→kind rules, deterministic fake generators, DOB shifting), `pseudonym.ts` (stable map persisted outside repo, reverse index), `scrub.ts` (recursive JSON/HAR walker incl. embedded JSON bodies, embedded-pattern + known-real substitution in free text), `cli-support.ts`/`cli.ts` (directory scrub, self-check, raw deletion after success, in-repo path refusal), README, 12 unit tests.
- Technical decisions: stability comes from the persisted map (not a code salt), so a lost map changes pseudonyms but never leaks PHI; fakes use shapes that don't re-match real patterns (+1 555 phones, FAKE…/MRN… ids, example.org emails) and the reverse index makes scrubbing idempotent; DOB shift is per-value deterministic (1–3650 days, date-granularity preserved); generic `id`/UUID fields left alone — only MRN/patient/visit/encounter identifiers are pseudonymized so fixture joins stay meaningful.
- Impact: additive only; no server/client changes.
- Testing evidence: `npm test` 12/12; `npm run build` green; CLI run end-to-end twice with identical output and 0 new map entries (cross-run stability), raw file deleted by default, in-repo raw path refused.
- Limitations: names in free text are only scrubbed when the name was already mapped from a structured field (unknown names in arbitrary prose are undetectable generically); live-dev-copy spot-check to be executed with the first real capture session.
- Future: wire into the Phase 1 capture pipeline (issue #33) so scrubbing is mandatory before fixtures are written to disk.
