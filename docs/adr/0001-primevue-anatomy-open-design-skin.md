# PrimeVue 4 as UI anatomy with Open Design owning the skin and page layout

The Vue 3 migration (see `tasks/VUE3_MIGRATION_ANALYSIS.md`) freezes business logic and
redesigns only the view layer. We decided the new client sits on **PrimeVue 4 + Tailwind**
for complex interactive components (data tables, date pickers, multi-selects, comboboxes,
dialogs, toasts), with **Open Design** (github.com/nexu-io/open-design) as the design
authority. No UI code is salvaged from the abandoned `client-vue-3` attempt (its reka-ui
shadcn-style kit, layouts, and pages are discarded along with its drifted logic); only
logic-free tooling survives (Vite/tsconfig/vitest/CI scaffolding).

Authority split, agreed explicitly:

- **Open Design has full creative authority** over page layout, navigation, composition,
  and simple/static components (buttons, cards, panels, forms layout) — its HTML/CSS
  transcribes into Tailwind Vue components near 1:1.
- **PrimeVue owns the anatomy** of complex interactive components; Open Design designs
  the *skin* (theme tokens: palette, typography, radius, density) and the page around
  them, never the component's internal structure. Open Design briefs must be constrained
  to "design the skin around a PrimeVue-class table/picker", not "invent a table".

Token pipeline: one source of truth (Open Design's `DESIGN.md`/tokens) feeds both the
PrimeVue 4 theme layer and the Tailwind config.

## Considered Options

- **reka-ui/headless + hand-build** (the `client-vue-3` approach): total design freedom,
  but months of component engineering before any hospital page ships, and it is the
  contaminated surface of the failed first attempt. Rejected.
- **shadcn-vue**: is reka-ui underneath — excluded by the same ruling.
- **Naive UI / Element Plus / Ant Design Vue**: weaker table/select/date-picker depth for
  ERP-density screens, or harder to reskin to the Open Design tokens. Rejected.
- **PrimeVue in styled mode out-of-the-box**: would fight the Open Design look; we use
  token-based theming instead.

## Consequences

- Open Design is not granted unlimited authority: designs for table/picker/select screens
  must be produced against the fixed anatomy, or they become unimplementable wishes.
- Open Design's "refresh an existing repo against DESIGN.md" mode allows the pipeline to
  run library-skeleton-first, design-restyles-later.
- Charts stay on apexcharts (Vue 3 build exists); the single wangeditor usage moves to
  `@wangeditor/editor-for-vue@next`. Mechanical mappings, not design decisions.
