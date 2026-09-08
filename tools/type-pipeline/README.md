# @ehmrs/type-pipeline

ADR-0004 type pipeline (issue #39): client API types are **ascertained, never invented**.

- **Request types** come from the server's own ground truth: Joi schemas in
  `server/src/modules/<Module>/validations.ts` and TS interfaces in the module's
  `interface/*.ts` / `types/*.ts`. The server is read, never modified.
- **Response types** are inferred from the scrubbed fixture corpus produced by
  the #36 contract harness (`client-vue3/src/contract/fixtures/<flow>.json`).
  The server only types the response envelope, so payloads are derived purely
  from observed data.
- **Uncertainty rule**: fields observed in only *some* scenarios of a route are
  emitted optional (`field?:`); fields never observed are never invented. A
  route with no captured fixtures is a hard error ("refusing to guess").
- Generated files are committed, reviewed code in `client-vue3/src/types/api/`,
  regenerable with stable, PR-diffable output.

## Commands

```bash
cd tools/type-pipeline
npm run generate   # (re)build + regenerate all configured modules into client-vue3/src/types/api/
npm run check      # exit 1 if committed files drifted from regeneration (CI / PR gate)
npm test           # unit tests + committed-snapshot stability test
```

## Adding a domain (every later module reuses this)

1. Capture + scrub fixtures for the flow with the contract harness (#36) so
   `client-vue3/src/contract/fixtures/<flow>.json` exists.
2. Add an entry to `config/modules.json`:

```json
{
  "flow": "patient",
  "serverDir": "server",
  "moduleDir": "Patient",
  "fixtureFile": "client-vue3/src/contract/fixtures/patient.json",
  "requests": [
    { "kind": "joi", "fn": "validateCreatePatient", "name": "CreatePatientRequest" },
    { "kind": "interface", "file": "types/patient.types.ts", "from": "PatientParam", "name": "PatientRequest", "omit": ["user_id"] }
  ],
  "responses": [
    { "method": "GET", "path": "/api/patients", "name": "PatientListResponse" }
  ]
}
```

   - `kind: "joi"` — the exported function name in the module's `validations.ts`
     is loaded under `ts-node` (transpile-only) and its `Joi.object(...)` schema
     is captured via `schema.describe()`; `.required()` ⇒ required property.
   - `kind: "interface"` — an exported server interface extracted via the TS
     AST (`omit` drops server-injected fields like `user_id`).
   - Every response spec **must** have fixture scenarios for its exact
     `METHOD path`; every fixture route **must** be mapped — both directions
     fail the generator, so coverage gaps cannot slip through silently.
3. `npm run generate`, review the diff (that review is the point), commit.
4. Later: run `npm run check` in CI/PRs to force regeneration diffs to be explicit.

## Limitations

- Inference is structural: JSON value shapes plus literal unions for the
  envelope `status` field; everything else is `string`/`number`/`boolean`.
  Semantic narrowing (e.g. ISO dates) is left to consuming code until
  warranted by fixtures.
- `data` payload types reflect only what was captured; they tighten as the
  corpus grows (re-run `generate` after new captures).
