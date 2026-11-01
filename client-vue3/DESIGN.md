# DESIGN.md — eHMRS Vue 3 design system

Status: **approved direction** (owner, 2026-11-01): **Calm workspace**. Quiet sidebar, borderless lists, roomy rows, one main action, teal accent, light mode only. LTR only, no RTL.

This file is the **single source of truth** for design tokens. The token pipeline
(`tools/token-pipeline`) parses the `### tokens:` tables below and generates the Tailwind
tokens (`tailwind.tokens.ts`). Never edit the generated file by hand; change a table here and
run `cd tools/token-pipeline && npm run generate`.

## Product and operating context

eHMRS is a hospital ERP client with roughly 480 views. Its centre of gravity is dense,
repetitive data work: patient lists, lab result entry, pharmacy dispense, store
inventory, admissions, and reports. Nurses, pharmacists, lab scientists, and records
staff use these screens for rapid entry and verification, including overnight shifts.

The system therefore optimizes for scan speed, comparison, keyboard flow, and visible
state over marketing-style spaciousness. Density is a usability requirement: whitespace
must clarify groups and hierarchy without lowering the amount of decision-relevant data
visible in a working viewport.

## Non-negotiables

1. **Calm comes first.** Data screens use 44px rows, 38px controls and 14px text, with 32px rows as a dense option for long lab and stock lists. Separate content with space and hairlines, not boxes. Each view has one solid action; other actions stay quiet. Any interactive target must expose a ≥24px hit area.
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

## Complex-component brief constraints (ADR-0010)

Open Design has full authority over page layout, navigation, composition, and how every
component looks. These designs must be expressible near 1:1 as Tailwind Vue components.

For interactive components, reka-ui owns behaviour and accessibility: keyboard use, focus,
ARIA, and overlays. Open Design styles those components freely, but a design must be
achievable on the primitive and may not redefine its behaviour. A brief that says "design
a date picker" must name the primitive it builds on.

Kit foundations pinned by the archetypes:

| Component | Foundation | Token entry points |
| --- | --- | --- |
| Data grid | Native `<table>` | `surface`, `text`, `table.row.height`, `table.cell.padding` |
| Pickers | reka-ui Combobox / DatePicker | `control.*`, `focus` |
| Overlays | reka-ui Dialog / Popover | `surface`, `shadow.md` |
| Buttons | Native `<button>` (`sm` default) | `action`, `primary`, `success`/`danger`/`warning` solids and `.on` |
| Editors | Native `<input>` / `<textarea>` | `control.*`, `focus` |
| Feedback | reka-ui Toast | `*.subtle.bg` + `*.subtle.text` pairs |
| Charts | apexcharts (per ADR-0010) | palette ramps only |

## Provenance and rationale

- **Direction: Calm workspace** — chosen by the owner on 2026-11-01 after rejecting the earlier Blueprint-style dense prototype as dated. Research and the options shown are in https://claude.ai/artifact/RsrqeTNoxNmKbjT9XXgYim.
- **Why these sizes:** IBM Carbon treats 40px rows as its default and small rows as a special case for very dense layouts. Linear's redesign reduced chrome and limited accent colour.
- **Type:** Figtree for text and Geist Mono for numbers and identifiers, both self-hosted so they work without internet.

Changing this direction, the teal accent or light-only v1 requires a new owner review. It must not enter the token tables as an unannounced reseed.

## Archetype and export contract (ADR-0009)

This system seeds a kit of approximately 6–10 reusable page archetypes:

- list with filters;
- detail with tabs;
- entry form or wizard;
- dashboard;
- report with export;
- settings;
- one exemplar domain spanning authentication, list, and form.

Every archetype must name the kit component responsible for each complex interaction. Bespoke screen design is reserved for patient search/registration, triage,
lab result entry, and dispense/verify, where the clinical workflow carries higher risk.

Design exports must use generated token names and Tailwind utilities so implementation
can be transcribed directly—for example, `bg-surface-page`, `text-ink`, `min-h-sm`, and `text-sm`. One-off hex values are forbidden: if a new
color is necessary, add it to an existing parser-supported token table and declare every
required foreground/background contrast pair. Any entirely new token group must first
be proposed in prose for the code side to wire into the pipeline.

## Review gates

Before an archetype or high-stakes screen is accepted:

1. Confirm data-screen controls use `sm` by default and `lg` appears only for an
   isolated-page primary CTA.
2. Confirm numeric data uses `font.mono` with tabular numerals.
3. Confirm every complex component maps to a pinned kit foundation above.
4. Confirm every data-bearing foreground/background pairing is declared in
   `contrast.pairs` and passes 4.5:1.
5. Confirm the export contains no one-off color values or hand-written dark-mode
   overrides.

## Tokens

Value syntax: `#rrggbb` literals, `Npx`/`N.rem` sizes, bare numbers, compound sizes
(`4px 8px`), or `{dotted.ref}` to another token. Refs resolve across all tables; the
pipeline fails on unknown or circular refs.

### tokens:palette.blue

| token | value | note |
| --- | --- | --- |
| blue.50 | #eff6ff | subtle tint backgrounds |
| blue.100 | #dbeafe | |
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
| gray.50 | #fbfbfa | page background |
| gray.100 | #f1f2f1 | alt surface, hover tint |
| gray.200 | #e6e7e6 | subtle borders, dividers |
| gray.300 | #d5d8d6 | default control borders |
| gray.400 | #9aa1a0 | disabled, decorative icons |
| gray.500 | #5f676e | muted text  |
| gray.600 | #4f565c | secondary text (7.56:1 on white) |
| gray.700 | #3a4045 | |
| gray.800 | #2a2e33 | |
| gray.900 | #1b1f23 | primary text, on-warning |
| gray.950 | #121518 | |

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
| green.700 | #15803d | success.action (white on it: 5.02:1) |
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
| amber.400 | #fbbf24 | warning.active |
| amber.500 | #f59e0b | warning.hover |
| amber.600 | #d97706 | warning.action (gray.900 on it: 5.6:1) |
| amber.700 | #b45309 | |
| amber.800 | #92400e | warning subtle text |
| amber.900 | #78350f | |
| amber.950 | #451a03 | |

### tokens:palette.teal

| token | value | note |
| --- | --- | --- |
| teal.50 | #eef7f6 | accent tint |
| teal.100 | #d6ecea | selected row |
| teal.200 | #b4dcd8 |  |
| teal.300 | #86c5bf |  |
| teal.400 | #4fa59e |  |
| teal.500 | #23857e |  |
| teal.600 | #127872 |  |
| teal.700 | #0b6e69 | accent |
| teal.800 | #095a56 | accent hover |
| teal.900 | #07483f | accent active |
| teal.950 | #04302b |  |

### tokens:palette.purple

| token | value | note |
| --- | --- | --- |
| purple.50 | #faf5ff | info subtle bg |
| purple.100 | #f3e8ff | |
| purple.200 | #e9d5ff | |
| purple.300 | #d8b4fe | |
| purple.400 | #c084fc | |
| purple.500 | #a855f7 | |
| purple.600 | #9333ea | |
| purple.700 | #7e22ce | info solid, subtle text |
| purple.800 | #6b21a8 | |
| purple.900 | #581c87 | |
| purple.950 | #3b0764 | |

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
| text.muted | {gray.500} | placeholders, meta — AA on page, alt, and selected rows |
| text.disabled | {gray.400} | decorative only, never data |
| text.on.primary | #ffffff | on teal solids |
| border.default | {gray.300} | |
| border.subtle | {gray.200} | |
| primary.color | {teal.700} | accent: links, selection, focus |
| action.default | {gray.900} | the one solid button in a view |
| action.hover | {gray.800} | |
| action.active | {gray.700} | |
| action.on | #ffffff | |
| primary.hover | {teal.800} | |
| primary.active | {teal.900} | |
| primary.subtle.bg | {teal.50} | info/selected tint |
| primary.subtle.text | {teal.800} | text on primary tint |
| primary.on | #ffffff | |
| danger.default | {red.600} | destructive actions |
| danger.hover | {red.700} | |
| danger.active | {red.800} | |
| danger.subtle.bg | {red.50} | error tint |
| danger.subtle.text | {red.700} | error text |
| danger.on | #ffffff | |
| success.default | {green.700} | confirm actions |
| success.hover | {green.800} | |
| success.active | {green.900} | |
| success.subtle.bg | {green.50} | ok tint |
| success.subtle.text | {green.700} | ok text |
| success.on | #ffffff | |
| warning.default | {amber.600} | caution actions |
| warning.hover | {amber.500} | lightens: warning.on is dark text |
| warning.active | {amber.400} | |
| warning.subtle.bg | {amber.50} | caution tint |
| warning.subtle.text | {amber.800} | caution text |
| warning.on | {gray.900} | dark text on amber solids |
| info.default | {purple.700} | informational status badges |
| info.subtle.bg | {purple.50} | info tint |
| info.subtle.text | {purple.700} | info text |
| info.on | #ffffff | |
| neutral.default | {gray.700} | neutral status badges (legacy dark, secondary) |
| neutral.subtle.bg | {gray.100} | neutral tint |
| neutral.subtle.text | {gray.700} | neutral text |
| neutral.on | #ffffff | |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| control.height.xs | 30px | row actions, inline filters |
| control.height.sm | 38px | **default** for all data screens |
| control.height.md | 40px | dialogs, one-off forms |
| control.height.lg | 44px | primary CTA / marketing islands |
| control.font.xs | 13px | row actions, table headers, meta |
| control.font.sm | 14px | **default** data font |
| control.font.md | 15px | dialog body |
| control.font.lg | 18px | lg controls |
| control.font.xl | 22px | page titles |
| control.padding.x | 12px | default horizontal control padding |
| control.padding.y.sm | 8px | sm control vertical padding (38px total) |
| control.padding.y.xs | 4px | xs control vertical padding (30px total) |
| control.padding.y.lg | 10px | lg control vertical padding (44px total) |
| control.padding.x.xs | 10px | xs horizontal padding |
| table.row.height | 44px | default row |
| table.row.height.dense | 32px | dense mode |
| table.cell.padding | 4px 12px | body cell padding |
| table.cell.padding.dense | 3px 8px | dense-mode cell padding |
| table.header.cell.padding | 9px 12px | header cell padding |
| icon.size.sm | 16px | inline with 14px text |
| icon.size.md | 18px | standalone |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| font.sans | Figtree Variable, Figtree, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif | UI text |
| font.mono | Geist Mono, ui-monospace, monospace | numbers and identifiers: doses, lab values, money, hospital numbers |
| font.weight.regular | 400 | |
| font.weight.medium | 500 | emphasis in tables |
| font.weight.semibold | 600 | headers, labels |
| line.height | 1.5 | body text |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| radius.none | 0px | |
| radius.xs | 4px | checkboxes, small marks |
| radius.sm | 8px | **default** — inputs, buttons |
| radius.md | 10px | cards, panels |
| radius.lg | 12px | overlays, dialogs |
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
| focus.ring.color | {teal.700} | |
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
| text.primary | teal.100 | data-text | 4.5 |
| text.secondary | teal.100 | data-text | 4.5 |
| text.muted | surface.0 | data-text | 4.5 |
| text.muted | surface.50 | data-text | 4.5 |
| text.muted | surface.100 | data-text | 4.5 |
| text.muted | teal.100 | data-text | 4.5 |
| primary.color | surface.0 | data-text | 4.5 |
| primary.color | surface.50 | data-text | 4.5 |
| primary.color | surface.100 | data-text | 4.5 |
| action.on | action.default | data-text | 4.5 |
| action.on | action.hover | data-text | 4.5 |
| action.on | action.active | data-text | 4.5 |
| text.on.primary | primary.color | data-text | 4.5 |
| text.on.primary | primary.hover | data-text | 4.5 |
| text.on.primary | primary.active | data-text | 4.5 |
| danger.on | danger.hover | data-text | 4.5 |
| danger.on | danger.active | data-text | 4.5 |
| success.on | success.hover | data-text | 4.5 |
| success.on | success.active | data-text | 4.5 |
| warning.on | warning.hover | data-text | 4.5 |
| warning.on | warning.active | data-text | 4.5 |
| primary.subtle.text | primary.subtle.bg | data-text | 4.5 |
| danger.subtle.text | danger.subtle.bg | data-text | 4.5 |
| success.subtle.text | success.subtle.bg | data-text | 4.5 |
| warning.subtle.text | warning.subtle.bg | data-text | 4.5 |
| danger.on | danger.default | data-text | 4.5 |
| success.on | success.default | data-text | 4.5 |
| warning.on | warning.default | data-text | 4.5 |
| info.on | info.default | data-text | 4.5 |
| info.subtle.text | info.subtle.bg | data-text | 4.5 |
| neutral.on | neutral.default | data-text | 4.5 |
| neutral.subtle.text | neutral.subtle.bg | data-text | 4.5 |
| text.disabled | surface.0 | decorative | 0 |
