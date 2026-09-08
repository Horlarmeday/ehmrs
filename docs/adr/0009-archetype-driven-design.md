# Archetype-driven design: Open Design designs patterns and key screens, not every page

~480 views cannot be individually prototyped — per-view design (or no design, raw
PrimeVue) are both unacceptable at this scale. Decision: one early Open Design session
produces the `DESIGN.md` (seeded from a shipped dense-dashboard system, customized with a
hospital density scale and WCAG-AA data-text contrast as non-negotiables), the PrimeVue
token theme, and a catalog of **~6–10 page archetypes** as polished HTML prototypes:
list-with-filters, detail-with-tabs, entry-form/wizard, dashboard, report+export,
settings — plus one exemplar domain (auth + a list view + a form view).

Per domain thereafter: each view maps to an archetype and is implemented directly against
the pattern. Open Design is invoked per-screen only for the hospital's high-stakes UX
flows (patient search/registration, triage, lab result entry, dispense/verify) in refresh
mode. Archetypes pin which PrimeVue anatomy implements each complex innards (per ADR-0001
authority split). The archetype catalog is a standing post-migration artifact — new views
get built against it.

Consequences: Phase 2's design cost is paid once (the catalog), not per-view; most
back-office views gain consistency instead of bespoke attention; bespoke design effort
concentrates where interaction quality affects clinical work.
