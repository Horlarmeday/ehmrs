# All-TypeScript client; types ascertained, never invented

The migration goes all-in TypeScript (rejected: keeping ported logic as `.js` with strict
TS only on the UI layer), with one governing rule that resolves the drift risk that killed
attempt #1 (its hand-written API types were fiction): **client-side API types are
ascertained from ground truth, never invented.**

Two derivation sources, verified against the server (Node/Express/TS/Sequelize/Joi):

- **Request types** — generated from the server's own definitions: module `types/*.ts`
  (e.g. `Patient/types/patient.types.ts`) and Joi schemas in each module's
  `validations.ts` (via `joi-to-typescript` or equivalent).
- **Response types** — inferred from captured API fixtures (observed responses from the
  running Vue 2 app against the dev server). The server does not type response payloads:
  `SuccessResponse<T = any>` — only the envelope exists.
- **Uncertainty rule**: fields never observed in fixtures are optional/`unknown`, never
  guessed non-nullable; types tighten as fixtures accumulate. Ambiguity = stop and ask.

## Consequences

- The Phase 1 fixture capture is load-bearing twice over: contract tests *and* response
  type derivation share it. Capture quality and coverage gate everything downstream.
- Generated types live in the client as committed, reviewed code (a `types/api/` layer),
  regenerable, diffable in PRs.
- Server-side response typing (`SuccessResponse<T>`) could be backfilled later but is out
  of migration scope; the server is read, not modified, during this migration.
