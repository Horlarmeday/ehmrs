# Pinia (not Vuex 4) for the ported stores, under a fixed translation dialect

The migration plan recommended Vuex 4 as a drop-in bridge (same module code, same
dispatch contracts) with an optional Pinia move post-cutover. The owner overrode this:
Vuex 4's maintenance-mode status is considered more expensive than the translation cost,
and Pinia is Vue 3's official direction — the translation would be paid eventually anyway.

Decision: the 23 Vuex modules port directly to **Pinia**, under a fixed "dialect" that
keeps the translation rule-based rather than designed:

- Each Vuex module → one Pinia store; store `id` = legacy module name; same file layout.
- Every action keeps its exact name, body, and payload shape; axios calls byte-identical.
- Every mutation becomes a **same-named action** with the same body — no devolving to
  idiomatic direct state assignment during migration (that is a post-cutover cleanup).
- Cross-module `dispatch('x/y')` → import and call `useXStore().y()`, recorded in the
  module's mapping table.
- View scripts: `this.$store.dispatch/getters/commit/state` → direct Pinia store access
  per the per-module mapping table, under the ADR-0002 frozen-script rule.

## Consequences

- The line-by-line old↔new diff check is no longer sufficient on its own: fixture-based
  contract tests (same call in ⇒ same HTTP request out; same response in ⇒ same state
  transition) become the **primary** drift gate. No view wires to a store that is not
  contract-green.
- Idiomatic Pinia cleanup (folding trivial mutation-actions into direct assignments,
  regrouping) is deferred to post-cutover, alongside the composable extraction.
