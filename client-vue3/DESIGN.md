# DESIGN.md — eHMRS Vue 3 design system

Status: **approved direction** (issue #40 HITL gate, 2026-09-08): seeded from **Palantir
Blueprint** (dense data-grid system), accent **hospital blue**, **light mode only** in v1.
LTR only — no RTL.

This file is the **single source of truth** for design tokens. The token pipeline
(`tools/token-pipeline`) parses the `### tokens:` tables below and generates BOTH the
PrimeVue preset (`src/design/ehmrs.preset.ts`) and the Tailwind tokens
(`tailwind.tokens.ts`). Never edit the generated files by hand; change a table here and
run `cd tools/token-pipeline && npm run generate`.

## Non-negotiables

1. **Density is ERP-scale, not marketing-scale.** The default control size on data
   screens is `sm` (28px tall, 12px font, 8px horizontal padding). Marketing-scale
   (`lg`, 40px) is reserved for primary CTAs on isolated pages (login, empty states).
   Table rows default to 30px; dense mode 26px. Any interactive target must expose a
   ≥24px hit area (visual size may be smaller with padding).
2. **WCAG-AA contrast for data-bearing text.** Every `data-text` pair declared in the
   `contrast.pairs` table must measure ≥4.5:1. The pipeline computes the ratio at
   generation time and **refuses to emit** a non-AA pair — this rule is enforced in code
   (`src/contrast.ts`), not by review vigilance. This is for the nurse reading lab
   values and medication data at 2am. `ui`-class pairs (decorative, non-data) require
   ≥3:1; `decorative` pairs are exempt.
3. **Numeric data is mono + tabular.** Quantities, dosages, lab values, money render in
   `font.mono` with tabular numerals (`font-variant-numeric: tabular-nums`) so columns
   of numbers align.
4. **Light mode only** in v1. Dark tokens may be added later as a second token set
   through this same pipeline; hand-written dark overrides are forbidden.

## Complex-component brief constraints (ADR-0001)

Open Design owns layout, composition, and simple components. For complex interactive
components Open Design designs **the skin around fixed PrimeVue anatomy** — palette,
typography, radius, density, state colors — and the page around the component. It never
invents the component's internal structure. A brief that says "design a table" is
malformed; it must say "design the skin around a PrimeVue-class DataTable".

PrimeVue anatomy pinned by the archetypes (skin targets of this token set):

| Anatomy | PrimeVue component | Skin entry points |
| --- | --- | --- |
| Data grid | DataTable | `formField`, `text`, `surface`, row paddings (`table.cell.padding`) |
| Pickers | DatePicker / Select / MultiSelect | `formField` (+ `sm` variant), `focus` |
| Overlays | Dialog / Drawer / OverlayPanel | `surface`, `shadow.md` |
| Buttons | Button (`sm` default) | `primary`, `success`/`danger`/`warning` solids |
| Editors | InputText / Textarea / InputNumber | `formField`, `focus` |
| Feedback | Toast / Message | `*.subtle.bg` + `*.subtle.text` pairs |
| Charts | apexcharts (per ADR-0001) | palette ramps only |

## Provenance and rationale

- **Seed: Palantir Blueprint** — shipped dense-dashboard system (30px table rows, 24/28/32px
  control ladder, tabular numerals, restrained neutral surfaces). Its information-density
  temperament is customized here: hospital blue accent, 3px radii (Blueprint 2–3px),
  visible 2px focus ring (WCAG 2.2 focus appearance), Inter instead of Blueprint Sans.
- **Accent: hospital blue** — continuity with the Vue 2 app's blue family, chosen at the
  #40 HITL session over clinical teal and health-sector green.
- Typography stack and mono stack predate this document (tooling scaffold, #34).

## Tokens

Value syntax: `#rrggbb` literals, `Npx`/`N.rem` sizes, bare numbers, compound sizes
(`4px 8px`), or `{dotted.ref}` to another token. Refs resolve across all tables; the
pipeline fails on unknown or circular refs.

### tokens:palette.blue

| token | value | note |
| --- | --- | --- |
| blue.50 | #eff6ff | subtle tint backgrounds |
| blue.100 | #dbeafe | selected-row tint |
| blue.200 | #bfdbfe | |
| blue.300 | #93c5fd | |
| blue.400 | #60a5fa | |
| blue.500 | #3b82f6 | |
| blue.600 | #2563eb | primary.action |
| blue.700 | #1d4ed8 | primary.hover, links on tint |
| blue.800 | #1e40af | primary.active |
| blue.900 | #1e3a8a | |
| blue.950 | #172554 | |

### tokens:palette.gray

| token | value | note |
| --- | --- | --- |
| gray.50 | #f9fafb | page background |
| gray.100 | #f3f4f6 | alt surface, hover tint |
| gray.200 | #e5e7eb | subtle borders, dividers |
| gray.300 | #d1d5db | default control borders |
| gray.400 | #9ca3af | disabled, decorative icons |
| gray.500 | #6b7280 | muted text (4.76:1 on white) |
| gray.600 | #4b5563 | secondary text (7:1 on white) |
| gray.700 | #374151 | |
| gray.800 | #1f2937 | |
| gray.900 | #111827 | primary text, on-warning |
| gray.950 | #030712 | |

### tokens:palette.red

| token | value | note |
| --- | --- | --- |
| red.50 | #fef2f2 | danger subtle bg |
| red.100 | #fee2e2 | |
| red.200 | #fecaca | |
| red.300 | #fca5a5 | |
| red.400 | #f87171 | |
| red.500 | #ef4444 | |
| red.600 | #dc2626 | danger.action (white on it: 4.8:1) |
| red.700 | #b91c1c | danger.hover, subtle text |
| red.800 | #991b1b | |
| red.900 | #7f1d1d | |
| red.950 | #450a0a | |

### tokens:palette.green

| token | value | note |
| --- | --- | --- |
| green.50 | #f0fdf4 | success subtle bg |
| green.100 | #dcfce7 | |
| green.200 | #bbf7d0 | |
| green.300 | #86efac | |
| green.400 | #4ade80 | |
| green.500 | #22c55e | |
| green.600 | #16a34a | |
| green.700 | #15803d | success.action (white on it: 4.7:1) |
| green.800 | #166534 | success.hover, subtle text |
| green.900 | #14532d | |
| green.950 | #052e16 | |

### tokens:palette.amber

| token | value | note |
| --- | --- | --- |
| amber.50 | #fffbeb | warning subtle bg |
| amber.100 | #fef3c7 | |
| amber.200 | #fde68a | |
| amber.300 | #fcd34d | |
| amber.400 | #fbbf24 | |
| amber.500 | #f59e0b | |
| amber.600 | #d97706 | warning.action (gray.900 on it: 5.6:1) |
| amber.700 | #b45309 | warning.hover |
| amber.800 | #92400e | warning subtle text (6.8:1 on amber.50) |
| amber.900 | #78350f | |
| amber.950 | #451a03 | |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| surface.0 | #ffffff | cards, inputs, overlays |
| surface.50 | {gray.50} | page background |
| surface.100 | {gray.100} | alt rows, hover tint |
| surface.200 | {gray.200} | subtle border |
| surface.300 | {gray.300} | control border |
| text.primary | {gray.900} | data-bearing text, 17:1 on white |
| text.secondary | {gray.600} | labels, captions carrying data |
| text.muted | {gray.500} | placeholders, meta — still AA |
| text.disabled | {gray.400} | decorative only, never data |
| text.on.primary | #ffffff | on blue solids |
| border.default | {gray.300} | |
| border.subtle | {gray.200} | |
| primary.color | {blue.600} | actions, links |
| primary.hover | {blue.700} | |
| primary.active | {blue.800} | |
| primary.subtle.bg | {blue.50} | info/selected tint |
| primary.subtle.text | {blue.700} | text on primary tint |
| primary.on | #ffffff | |
| danger.default | {red.600} | destructive actions |
| danger.hover | {red.700} | |
| danger.subtle.bg | {red.50} | error tint |
| danger.subtle.text | {red.700} | error text |
| danger.on | #ffffff | |
| success.default | {green.700} | confirm actions |
| success.hover | {green.800} | |
| success.subtle.bg | {green.50} | ok tint |
| success.subtle.text | {green.700} | ok text |
| success.on | #ffffff | |
| warning.default | {amber.600} | caution actions |
| warning.hover | {amber.700} | |
| warning.subtle.bg | {amber.50} | caution tint |
| warning.subtle.text | {amber.800} | caution text |
| warning.on | {gray.900} | dark text on amber solids |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| control.height.xs | 24px | inline filters, dense toolbars |
| control.height.sm | 28px | **ERP default** for all data screens |
| control.height.md | 32px | dialogs, one-off forms |
| control.height.lg | 40px | primary CTA / marketing islands |
| control.font.xs | 11px | xs controls, table dense |
| control.font.sm | 12px | **ERP default** data font |
| control.font.md | 13px | dialog body |
| control.font.lg | 14px | lg controls |
| control.font.xl | 16px | page titles |
| control.padding.x | 8px | default horizontal control padding |
| control.padding.y.sm | 5px | sm control vertical padding (28px total) |
| control.padding.y.xs | 4px | xs control vertical padding (24px total) |
| control.padding.y.lg | 8px | lg control vertical padding (40px total) |
| control.padding.x.xs | 6px | xs horizontal padding |
| table.row.height | 30px | default row |
| table.row.height.dense | 26px | dense mode |
| table.cell.padding | 4px 8px | body cell padding |
| table.cell.padding.dense | 3px 5px | dense-mode cell padding |
| table.header.cell.padding | 5px 8px | header cell padding |
| icon.size.sm | 14px | inline with 12px text |
| icon.size.md | 16px | standalone |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| font.sans | Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif | UI text |
| font.mono | JetBrains Mono, Fira Code, ui-monospace, monospace | numerics: doses, lab values, money |
| font.weight.regular | 400 | |
| font.weight.medium | 500 | emphasis in tables |
| font.weight.semibold | 600 | headers, labels |
| line.height | 1.4 | dense multi-line |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| radius.none | 0px | |
| radius.sm | 3px | **default** — inputs, buttons, cells |
| radius.md | 4px | cards, panels |
| radius.lg | 6px | overlays, dialogs |
| radius.pill | 9999px | badges, toggles |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| shadow.sm | 0 1px 2px rgba(16,24,40,0.06) | cards |
| shadow.md | 0 2px 6px rgba(16,24,40,0.08) | dropdowns |
| shadow.lg | 0 4px 16px rgba(16,24,40,0.12) | modals |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| focus.ring.color | {blue.600} | |
| focus.ring.width | 2px | WCAG 2.2 focus appearance |
| focus.ring.style | solid | |
| focus.ring.offset | 1px | |

### tokens:contrast.pairs

| fg | bg | class | min |
| --- | --- | --- | --- |
| text.primary | surface.0 | data-text | 4.5 |
| text.primary | surface.50 | data-text | 4.5 |
| text.primary | surface.100 | data-text | 4.5 |
| text.secondary | surface.0 | data-text | 4.5 |
| text.secondary | surface.50 | data-text | 4.5 |
| text.secondary | surface.100 | data-text | 4.5 |
| text.muted | surface.0 | data-text | 4.5 |
| text.on.primary | primary.color | data-text | 4.5 |
| primary.subtle.text | primary.subtle.bg | data-text | 4.5 |
| danger.subtle.text | danger.subtle.bg | data-text | 4.5 |
| success.subtle.text | success.subtle.bg | data-text | 4.5 |
| warning.subtle.text | warning.subtle.bg | data-text | 4.5 |
| danger.on | danger.default | data-text | 4.5 |
| success.on | success.default | data-text | 4.5 |
| warning.on | warning.default | data-text | 4.5 |
| text.disabled | surface.0 | decorative | 0 |
