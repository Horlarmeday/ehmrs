# Archetype-driven design: Open Design designs patterns and key screens, not every page

~480 views cannot be individually prototyped — per-view design (or no design, raw
components) are both unacceptable at this scale. Decision: one early Open Design session
produces the `DESIGN.md` (seeded from a shipped dense-dashboard system, customized with a
hospital density scale and WCAG-AA data-text contrast as non-negotiables), the Tailwind
token theme, and a catalog of **~6–10 page archetypes** as polished HTML prototypes:
list-with-filters, detail-with-tabs, entry-form/wizard, dashboard, report+export,
settings — plus one exemplar domain (auth + a list view + a form view).

Per domain thereafter: each view maps to an archetype and is implemented directly against
the pattern. Open Design is invoked per-screen only for the hospital's high-stakes UX
flows (patient search/registration, triage, lab result entry, dispense/verify) in refresh
mode. Archetypes pin which kit component implements each complex innards (per ADR-0010
authority split). The archetype catalog is a standing post-migration artifact — new views
get built against it.

Consequences: Phase 2's design cost is paid once (the catalog), not per-view; most
back-office views gain consistency instead of bespoke attention; bespoke design effort
concentrates where interaction quality affects clinical work.

## Amendment (owner decision, 2026-11-13)

The archetype list above was chosen before the workflow research in `tasks/ui-ux-redesign.md`. The approved prototypes for patient search and registration and for lab result entry show which patterns the hospital's work actually needs, so v1 (#41) builds four archetypes:

- **List with filters**, from patient search.
- **Entry form**, as a page or inside a dialog, from patient registration.
- **Detail with tabs**, for records such as the patient chart.
- **Worklist with detail pane**, from lab result entry. It also fits Home, dispense, vitals, treatments and ward rounds.

The wizard is dropped: the legacy client has no multi-step forms. Dashboard, report with export and settings remain planned as follow-up archetypes with their own issues.

The archetypes also run inside a production app shell, built in #41, and every archetype works on touch-only Android tablets in portrait and landscape, used for ward rounds and vitals. On touch screens, controls grow to 44px through tokens.
