# Twin-patch rule for mid-migration bugfixes

EHMRS is live in a hospital; the Vue 2 client serves production for the entire ~4–6 month
migration, and just-in-time domain porting means each store exists as a Vuex module and a
Pinia twin simultaneously. A logic fix applied to one but not the other silently re-opens
the drift hole the migration is designed to close.

Rule: a bugfix touching store logic, the axios layer, or router guards in Vue 2 **must
land a same-PR (or blocking-linked-PR) patch to its Pinia twin, including updated contract
fixtures**. Severity gate: clinical-blocking / data-integrity bugs always get this
treatment; cosmetic UI bugs in Vue 2 are won't-fix unless trivial (that UI is being
replaced); new Vue 2 features are refused during the freeze — exceptions require the
owner's explicit sign-off. Rejected: batch-syncing accumulated fixes before each domain's
UI phase — reconciling two divergent files later is precisely the activity that produces
invented logic.
