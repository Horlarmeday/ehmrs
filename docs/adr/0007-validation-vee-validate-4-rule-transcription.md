# vee-validate 4 with rules package; rules are frozen logic extracted from templates

Code audit: vee-validate 2 is globally registered (`client/src/main.js:32`) and used in
~79–83 views via `$validator`/`errors.*` in scripts and `data-vv-*` attributes **inside
templates**. The vendored formvalidation plugin (236 TS files under
`client/src/assets/plugins/`) is dead code — no `.vue` imports — and dies with Metronic.

This exposed a gap in ADR 0002's frozen/free split: validation rules are business logic
(what makes a form submittable) but v2 expresses them in the template — the "free"
surface. Resolution: in Vue 3 the rules move into the **frozen script block** as
vee-validate 4 `rules` objects using the official `@vee-validate/rules` package (same
rule names/params as v2). Templates bind fields only; a redesigned template may not add,
drop, or alter a rule any more than it may drop a guard.

Per-view PRs include a rule transcription table (legacy `data-vv-*` / `$validator` call →
v4 equivalent), mechanically checkable like the rest of the frozen-script discipline.
Custom v2 rules, if encountered, port verbatim as v4 custom rules.

zod is deliberately rejected: schema composition is a different paradigm that invites
"improving" rules during transcription — the exact drift vector that produced attempt
#1's invented validation schemas.
