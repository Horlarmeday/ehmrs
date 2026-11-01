# reka-ui + Tailwind kit replaces PrimeVue, with Open Design still owning the look

Supersedes ADR-0001. The Vue 3 client builds its own small component kit in the repo on
**reka-ui + Tailwind**, instead of using PrimeVue.

PrimeVue 5 needs a paid PrimeUI license and shows an "Invalid PrimeUI License" badge
without a key. PrimeVue 4 stays MIT but receives security fixes only, which is a poor base
for an app expected to last years. ADR-0001 rejected reka-ui on two grounds that no longer
hold as stated: its "months of component engineering" was never measured, and most legacy
views use plain tables and selects (`<select>` 166, `<table>` 155, `v-select` 49, date
pickers 28); and the failed `client-vue-3` attempt failed on drifted logic, which the frozen
logic rules now guard against.

The decision rests on a spike (`spike/40-headless-kit`, 2026-11-01): criteria were fixed
first from legacy usage, then a table, result-entry grid, async select, and date picker
passed 18 Chromium tests with axe, in 436 lines, without patching the library. It ran on a
mock API. It did not cover real clinical screens, screen readers, or how long the full kit
takes to build.

Authority split:

- **Open Design has full creative authority** over layout, navigation, composition, and how
  every component looks, expressed in Tailwind and the generated tokens.
- **reka-ui owns behaviour and accessibility** of interactive components (keyboard, focus,
  ARIA, overlays). Designs must be achievable on its primitives; they may not redefine that
  behaviour.
- **DESIGN.md stays the one token source**, now feeding Tailwind only.

## Considered Options

- **PrimeVue 4**: free and the least work, but frozen. Rejected by the owner.
- **PrimeVue 5**: active, but paid per developer ($599, then $799 from 2027), on commercial
  terms under Turkish law. Rejected.
- **Element Plus / Vuetify / Quasar**: not tested. They would again tie the look to a
  library's own theme, the problem that left PrimeVue rendering off-token button colors.
- **shadcn-vue as a tool**: not adopted. Its copied-component pattern is what the kit
  follows, but components are written against DESIGN.md's tokens and density.
- **TanStack Table**: not adopted by default. In the spike it added little over a plain
  table, and legacy tables rarely sort. Reconsider if a screen needs real grid features.

## Consequences

- The repo owns kit bugs. Every interactive kit component needs Chromium tests covering
  keyboard use and axe, not just unit tests.
- A reka-ui upgrade needs those tests rerun. The kit overrides stale `aria-controls` and
  `aria-activedescendant` on a closed combobox, which reka-ui leaves pointing at removed
  elements.
- The first kit milestone (#41) must test against a real lab entry screen before the
  approach is relied on for clinical workflows. PrimeVue 4 is the fallback if it fails.
- Charts stay on apexcharts; the single wangeditor usage moves to
  `@wangeditor/editor-for-vue@next`. Unchanged from ADR-0001.
