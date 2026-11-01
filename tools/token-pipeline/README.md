# token-pipeline (issue #40, ADR-0010/0009)

`client-vue3/DESIGN.md` is the single source of truth for design tokens. This tool parses
its `### tokens:` tables, enforces the design contract, and generates
`client-vue3/tailwind.tokens.ts`: the Tailwind theme tokens (imported by
`tailwind.config.js`) and the `EHMRS_TOKENS` manifest used by the client's token tests.

## Commands

```bash
cd tools/token-pipeline
npm install
npm test          # vitest (parser strictness, contrast gate, determinism)
npm run generate  # regenerate the committed file from DESIGN.md
npm run check     # exit 1 if the committed file drifted from DESIGN.md (PR gate)
```

## The AA rule is enforced in code

Non-negotiable #2: every `data-text` pair in the `contrast.pairs` table must measure
≥ 4.5:1 (WCAG relative luminance). The generator computes each ratio and **refuses to
emit** if any pair fails — a non-AA DESIGN.md cannot produce artifacts. Declaring a
`data-text` min below 4.5 is a parse error. `ui` pairs require ≥ 3:1; `decorative` pairs
are exempt.

## Changing a token

1. Edit the table in `client-vue3/DESIGN.md` (values: `#rrggbb`, `Npx`, numbers, compound
   sizes like `4px 8px`, or `{dotted.ref}`).
2. `cd tools/token-pipeline && npm run generate`.
3. Commit DESIGN.md + the generated file together (the `--check` gate keeps them in sync).

## Table contract (strict)

- `### tokens:palette.<name>` — columns `token | value | note`; tokens prefixed with the
  palette name (`blue.600`), values must be `#rrggbb` literals.
- `### tokens:semantic` — columns `token | value | note`; one or more tables, merged.
- `### tokens:contrast.pairs` — columns `fg | bg | class | min`; class is
  `data-text | ui | decorative`.
- Unknown headers, unknown refs, circular refs, wrong prefixes: hard errors. The parser
  fails loudly rather than guessing — a drifted table must never silently restyle the app.

Dark mode: light-only in v1; a dark token set would be added as a second DESIGN.md-sourced
scheme through this same pipeline.
