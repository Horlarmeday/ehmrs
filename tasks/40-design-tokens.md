# Issue 40 — [Foundation 7/8] HITL: DESIGN.md + token pipeline

Parent: #33 (Vue 2 → Vue 3 migration PRD) · ADR-0001, ADR-0009 · Branch: `40-design-tokens` (from `svsh_branch`; #34–#39 already merged)

## What we build

The design authority and the one-source token pipeline:

1. **Open Design session (HITL)** — design direction seeded from a shipped dense-dashboard
   system, customized into `client-vue3/DESIGN.md` with two non-negotiables baked in:
   - **Density scale** with small-control sizes (ERP data entry, not marketing scale).
   - **WCAG-AA contrast** for data-bearing text (lab values, medication data at 2am).
   The owner approves the direction **before** the archetype kit (later issue) builds on it.
2. **Token pipeline** — `DESIGN.md` token tables are the single source; a generator emits
   BOTH the PrimeVue 4/5 theme preset (`definePreset`) and the Tailwind config tokens.
   Same operational shape as #39: committed generated artifacts, one regen command,
   `--check` drift gate for PRs.
3. **Token snapshot test** committed in client-vue3 — asserts generated files are current
   (byte-stable) and that the AA data-text contrast rule holds **programmatically**
   (contrast ratio computation over the token pairs DESIGN.md declares as data-bearing).
4. **Design-brief constraints** recorded in DESIGN.md for complex components: Open Design
   designs the *skin around fixed PrimeVue anatomy* (table/picker/select), never invents
   the anatomy (ADR-0001 authority split, restated as a briefing rule).

## Tasks

- [x] Branch `40-design-tokens` from `svsh_branch`
- [x] HITL session: owner picks seed direction + palette + mode strategy (recorded below in Review)
- [x] `client-vue3/DESIGN.md` authored:
  - [ ] Brand/seed provenance; LTR-only statement
  - [ ] Color tokens (primitive palette → semantic tokens: surface/text/border/state; data-text tokens flagged AA-mandatory)
  - [ ] Density scale: control heights (incl. `sm` as the ERP default), font sizes, table row heights, input padding, touch-min note for primary CTA exceptions
  - [ ] Typography (Inter/JetBrains Mono already in scaffold), spacing, radius, elevation, focus ring
  - [ ] Non-negotiables as explicit numbered rules (AA data-text ≥ 4.5:1; density defaults; no marketing-scale controls in data screens)
  - [ ] Complex-component brief constraints (skin-around-anatomy) + PrimeVue anatomy pin list
  - [ ] Token tables in a machine-parseable format (the pipeline's input contract)
- [x] `tools/token-pipeline/` package (npm, TS, vitest, mirrors #39 conventions):
  - [ ] `src/parse.ts` — parse DESIGN.md token tables (strict schema; fail loudly on ambiguity)
  - [ ] `src/primevue-preset.ts` — emit PrimeVue `definePreset` TS file mapping semantic tokens → preset slots (surface/inputtext/table/button/etc.)
  - [ ] `src/tailwind-tokens.ts` — emit Tailwind theme extension (colors from semantic tokens, density scale as height/size utilities, fontFamily/radius/shadow)
  - [ ] `src/contrast.ts` — WCAG relative-luminance ratio check; validates every token pair marked `data-text` ≥ 4.5:1 at generation time (pipeline refuses to emit non-AA data pairs)
  - [ ] `src/cli.ts` — `generate` + `--check` modes; deterministic byte-stable output
  - [ ] Unit tests: parser strictness, determinism, contrast gate (non-AA fixture ⇒ exit non-zero), preset/tailwind emission snapshots
- [x] Generated + committed: `client-vue3/src/design/ehmrs.preset.ts` (PrimeVue preset) + `client-vue3/tailwind.tokens.ts` (imported by `tailwind.config.js`; hand-written config reduced to content/plugins)
- [x] Wire preset into `src/main.ts` (PrimeVue theme config) — minimal, no page restyling (archetype kit is a later issue)
- [x] Client-side snapshot test `client-vue3/src/design/__tests__/tokens.spec.ts` — regeneration currency + AA data-text assertion
- [x] `tools/token-pipeline/README.md` — how to change a token, regen, and why AA is enforced in code
- [x] Verify: tool vitest green + tsc; client-vue3 `npm run lint` 0 errors, `vue-tsc -b && vite build` green, full vitest suite green
- [x] Commit `feat(#40): DESIGN.md + one-source token pipeline (PrimeVue preset + Tailwind), AA-gated`; PR to `svsh_branch`

## Acceptance criteria (from issue)

- [x] `DESIGN.md` authored with density scale + AA data-text contrast as explicit rules
- [x] Token pipeline generates PrimeVue 4 preset and Tailwind config from one source
- [x] Token snapshot test committed
- [x] Owner has approved the visual direction (HITL gate) — sign-off recorded in Review
- [x] Design brief constraints recorded for complex components (skin around fixed anatomy)

## Review

- Summary: `client-vue3/DESIGN.md` (Blueprint-seeded, hospital-blue, light-only, LTR-only; density scale + AA data-text contrast as numbered non-negotiables; skin-around-anatomy brief constraints + PrimeVue anatomy pin table) is the single token source. `tools/token-pipeline` parses its strict `### tokens:` tables and generates `src/design/ehmrs.preset.ts` (PrimeVue 5 `definePreset(Aura, …)`) and `tailwind.tokens.ts` (imported by `tailwind.config.js`); the preset is wired in `src/main.ts` with `darkModeSelector: 'none'`. No page restyling — the archetype kit is the next issue.
- HITL sign-off: direction approved by the owner at session start (2026-09-08) — seed **Palantir Blueprint**, accent **hospital blue** (over clinical teal / health-sector green), **light mode only** v1. Recorded per the issue's owner-approval AC.
- Technical decisions: (a) AA contrast is enforced in generation code — every `contrast.pairs` row is resolved to literals and measured (WCAG relative luminance); a failing pair aborts emission, and declaring a `data-text` min < 4.5 is a parse error — the rule cannot be reviewed away; (b) `--check` drift gate mirrors #39's stable-diff pattern (negative control verified: tampered artifact ⇒ exit 1); (c) PrimeVue 5 (5.0.1) preset = `definePreset(Aura, overrides)` over `@primeuix/themes@3` — we ship only skin overrides (ramps, `borderRadius`, typography, focusRing, text/surface/content/highlight, `formField` density, DataTable cell paddings); anatomy stays Aura's; (d) density: `formField` default = sm (12px font, 8px/5px padding ⇒ 28px controls), `sm` variant = xs (24px), `lg` = 40px CTA; `typography.fontSize` 12px makes DataTable text ERP-scale; (e) the generated preset embeds `EHMRS_TOKENS` (the DESIGN.md manifest) so the client test asserts AA + one-source properties without invoking the tool.
- Impact: additive to client-vue3 (new DESIGN.md, generated design files, one new test file, main.ts/theme wiring, tailwind.config now token-driven) and a new `tools/token-pipeline` package. No server or legacy-client changes; no view restyling.
- Testing evidence: tool vitest 12/12 (parser strictness incl. header/class/prefix/circular-ref rejection, WCAG math, non-AA refusal, byte-determinism, density-edit propagation); client-vue3 `eslint .` 0 errors, `vue-tsc -b && vite build` green, full vitest 40/40 (incl. new `src/design/__tests__/tokens.spec.ts`: AA pairs ≥ 4.5:1, density pins, Tailwind↔preset one-source equality, and a live proof that mounting a Button with the preset injects `--p-primary-color: #2563eb` + `--p-form-field-padding-y` into the document); `npm run check` OK, tamper negative control fails as required.
- Limitations: PrimeVue 5's `Primitive` type has no `pill` radius step — the pill value lives only in Tailwind (`rounded-full`) and the Button `roundedBorderRadius` literal; success/danger/warning Button fills still use Aura defaults (AA pairs cover the DESIGN-declared tints/solids used by Tailwind surfaces — component-level skinning widens with the archetype kit); a `[PrimeUI] license is not configured` stderr notice appears from primevue 5.0.1 at mount (vendor nag, no functional effect); generated artifacts are rem-based on the v5 16px baseline.
- Future: archetype kit issue consumes this preset; dark tokens as a second DESIGN-sourced scheme; consider a CI job running `tools/token-pipeline` `--check`.
