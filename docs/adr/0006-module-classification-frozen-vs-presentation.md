# Store module classification: frozen iff API-bearing; Metronic theme stores die

Refines the frozen/free boundary (ADR 0002/0003) at module level. Of the 23 Vuex modules,
three are Metronic presentation machinery with zero API access and die in the migration —
not ported, not replaced one-for-one:

- `breadcrumbs` (breadcrumb trail/pageTitle UI state)
- `config` (Metronic `layout.config.json` layout settings)
- `htmlclass` (`document.body.classList` toggling for Metronic skins)

The other 20 are frozen and port under the Pinia dialect (ADR 0003) — including `settings`
and `alert`, which look like infrastructure but carry axios calls and domain state
(clinical alerts, persisted app settings).

Classification rule for anything ambiguous later: **a module is frozen iff it calls the API
or encodes domain rules; pure presentation state is free surface** and gets redesigned (or
not recreated at all) by the new UI, which may author its own small UI-state stores as
fresh code under the free surface.

Carve-out to the frozen-script rule (ADR 0002): dispatches into the dead modules are
dropped, not ported. Only 6 non-layout views reference them — 4 are Metronic demo pages
already slated for deletion (`Builder.vue`, `Wizard-1/2/3`), the fifth is `Dashboard.vue`
(a breadcrumb dispatch = presentation), the rest are layout components that get redesigned.

Consequence: the upfront infrastructure port (Question 9, option b) shrinks to
`auth`, `settings`, `alert` + `axios.js` + router + `common/common.js` + harness/scrubber.
Router note: route-level breadcrumb/title metadata may survive into the new router for the
UI to use, but the store that consumed it does not.
