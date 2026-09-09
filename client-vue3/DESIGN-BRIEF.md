# Open Design brief — eHMRS design system revision

Audience: **Open Design** (design authority per ADR-0001/0009). You are revising
`DESIGN.md` (same folder) and will go on to design the archetype kit and high-stakes
screens. This brief is your contract with the code side.

## What you are designing

A hospital ERP client (Vue 3 + PrimeVue 4/5 + Tailwind) with ~480 views. The dominant
screens are dense data work: patient lists, lab result entry, pharmacy dispense, store
inventory, admissions, reports. Your users are nurses, pharmacists, lab scientists, and
records staff doing data entry and verification — often at 2am, often in a hurry.
Marketing-scale design (hero sections, generous whitespace, large controls) is wrong
here; ERP-density is the product.

## Authority split (binding, ADR-0001)

- **You have full authority** over page layout, navigation, composition, and
  simple/static components (buttons, cards, panels, form layout). Your HTML/CSS
  transcribes near 1:1 into Tailwind Vue components.
- **PrimeVue owns the anatomy** of complex interactive components (DataTable, date
  pickers, selects, comboboxes, dialogs, toasts). You design the **skin** — palette,
  typography, radius, density, state colors — and the page around them. Never the
  internal structure. A brief that says "design a table" is malformed; it must say
  "design the skin around a PrimeVue-class DataTable". The anatomy pin table in
  `DESIGN.md` lists the skin entry points per component.
- **Two non-negotiables are not yours to trade away** (owner-ratified, issue #40 HITL):
  1. ERP density scale — default control is `sm` (28px tall, 12px font); `lg` (40px)
     only for primary CTAs on isolated pages.
  2. WCAG-AA (≥4.5:1) for data-bearing text — enforced **in code**: the token pipeline
     measures every declared pair and refuses to emit a non-AA `data-text` pair. If a
     color you want fails the ratio, the build fails. Design within it.

## Approved direction (revise from here, not from zero)

- Seed: **Palantir Blueprint** (dense data-grid temperament: 24/28/32px control ladder,
  30px rows, tabular numerals, restrained neutrals).
- Accent: **hospital blue** (`#2563eb` family) — chosen over clinical teal and
  health-sector green at the #40 session.
- **Light mode only** in v1. LTR only.
- If you believe the direction itself should change (seed, accent, mode strategy), that
  is a HITL decision — flag it as a proposal with rationale; do not silently reseed.

## How to revise DESIGN.md (machine contract)

The `### tokens:` tables are **parsed by `tools/token-pipeline`** and generate both the
PrimeVue preset and the Tailwind config. The parser is strict on purpose.

You MAY:
- Edit token **values** and **notes** in place (hex, `Npx`, numbers, compound sizes like
  `4px 8px`, or `{dotted.ref}`).
- Add rows to existing tables (new palette steps, new semantic tokens, new contrast
  pairs — every fg/bg in `contrast.pairs` must resolve to declared tokens).
- Add prose sections, rationale, examples, imagery anywhere outside the tables.
- Propose entirely new token groups in prose for the code side to wire.

You MUST NOT:
- Rename/move/delete token tables, reformat table headers (`token | value | note`,
  `fg | bg | class | min`), or reorder the `palette.`/`semantic`/`contrast.pairs`
  structure.
- Declare a `data-text` pair below 4.5:1 (parse error) or use a non-`#rrggbb` palette
  value.
- Introduce dark-mode tokens (v1 is light-only by decision).

If you break the contract the pipeline fails loudly; if you change a value, rerun
`cd tools/token-pipeline && npm run generate` to see it applied. Regeneration is
byte-deterministic; a `--check` gate in review catches hand-edits to generated files.

## What happens next (ADR-0009)

Your revised DESIGN.md becomes the seed for the **archetype kit** session: ~6–10 page
archetypes as polished HTML prototypes (list-with-filters, detail-with-tabs,
entry-form/wizard, dashboard, report+export, settings) plus one exemplar domain
(auth + list + form). Each archetype pins which PrimeVue anatomy implements its complex
innards. Per-screen bespoke design is reserved for: patient search/registration, triage,
lab result entry, dispense/verify.

When you produce design exports, express them in Tailwind utilities + the DESIGN.md
tokens (e.g. `bg-surface-page text-ink h-9-[sm] text-sm`) so transcription stays 1:1;
avoid inventing one-off hex values — if a color is needed, it becomes a token.
