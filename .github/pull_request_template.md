## Summary

Closes #

Plan: `tasks/<issue>-<slug>.md`

## Migration checklist (delete if this PR does not touch `client`, `client-vue3` or `tools`)

- [ ] Twin-patch (ADR-0008): no legacy store, axios or router-guard change with a Vue 3 twin, or the twin and its contract fixtures are in this PR, or the blocking PR is linked here:
- [ ] Mapping, trace and rule transcription tables included (AGENTS.md "Templates"), legacy messages copied exactly
- [ ] Deviations from legacy listed, each an owner decision or a quality fix
- [ ] Fixtures scrubbed; grep for real values, `eyJ`, `$2a$`/`$2b$` came back empty
- [ ] Views use kit components and DESIGN.md tokens only; axe and 44px touch checks pass

## Local checks (no CI)

- [ ] `client-vue3`: `npm run lint`, `npm run build`, `npm test`, `npm run test:e2e` ×3
- [ ] `tools/type-pipeline` `npm run check`; `tools/token-pipeline` `npm run check` if tokens changed
- [ ] `server`: `yarn test` / `npx tsc --noEmit` if touched
