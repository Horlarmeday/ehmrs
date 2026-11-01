# Issue 40 — close-out plan

Issue: #40 · Parent: #33 · ADR-0001, ADR-0009 · Original plan: `tasks/40-design-tokens.md`
Status: **owner signed off 2026-11-01 (revised DESIGN.md and token changes); PR to `svsh_branch` next**

## Current state

PR #77 merged the design system and token pipeline into `svsh_branch` on 2026-09-09. Its
`Closes #40` did not fire because the PR did not target the default branch (`master`), so
the issue is still open with its acceptance criteria unticked. #41 (archetype kit) is
blocked by #40, and the tracer bullet and domain issues follow it.

This plan covers only what is left, not a rebuild.

| Acceptance criterion | State | Evidence (2026-11-01) |
| --- | --- | --- |
| `DESIGN.md` with density + AA rules | Done on `svsh_branch` | Non-negotiables 1 and 2 |
| Pipeline generates preset + Tailwind from one source | Done | `npm run check` OK, 12/12 tool tests |
| Token snapshot test | Done | `src/design/__tests__/tokens.spec.ts`, 4/4 |
| Owner approved visual direction | Recorded, not confirmed on the issue | Direction recorded in the original plan; revision not merged (gap 1) |
| Complex-component brief constraints | Done on `svsh_branch` | Anatomy pin table, `DESIGN-BRIEF.md` |

## Gaps found

1. **The DESIGN.md revision is not merged.** `e3e7c9de` (+62/-5) exists only on the local
   `40-design-tokens` branch. It adds the product context, archetype/export contract and
   review gates. It changes no token table rows. `DESIGN-BRIEF.md` was merged, but the
   revision it asked for was not.
2. **Uncommitted copy of that revision.** The `svsh_branch` working tree has
   `client-vue3/DESIGN.md` modified (mtime 2026-11-01 15:01:42), byte-identical to
   `40-design-tokens`. It was not changed by this planning session and has been left alone.
3. **The AA rule has holes.** `text.muted` is noted "still AA" but is only declared on
   `surface.0`, so the gate never measures the others:

   | Pair (not declared) | Ratio | Result |
   | --- | --- | --- |
   | `text.muted` on `surface.50` | 4.63 | Pass |
   | `text.muted` on `surface.100` (alt rows, hover) | 4.39 | **Fail** |
   | `text.muted` on `blue.100` (selected row) | 3.96 | **Fail** |
   | `primary.color` on `surface.100` (links) | 4.70 | Pass |
   | `text.primary` on `blue.100` | 14.54 | Pass |
   | `text.secondary` on `blue.100` | 6.19 | Pass |

4. **Semantic button tokens may not reach PrimeVue.** `success/danger/warning.default` and
   `.on` are declared and AA-checked, but the preset's `components.button` does not set them.
   The original Review says those fills still use Aura defaults, while the anatomy table
   lists them as skin entry points. If Aura renders white on its 500 steps, that is 2.28:1
   on green and 3.76:1 on red. **The rendered colors are unverified**: reading Aura's button
   tokens returned empty, so task 3 measures them in a mounted component.
5. **Doc inaccuracies.**
   - Palette notes: `gray.500` says 4.76:1 (measures 4.83) and `green.700` says 4.7:1
     (measures 5.02).
   - Review gate 3 says the anatomy table is "below", but it is above.
   - `DESIGN-BRIEF.md` cites `h-9-[sm]` as a utility; check it against `tailwind.tokens.ts`.

## Tasks

Branch: `40-design-closeout` from `svsh_branch`. Complexity: S = under 30 min, M = under 2 h.

- [x] **1. Land the revision (S).** Move `e3e7c9de` onto the branch and clear the
      uncommitted copy only after confirming it still matches.
      *Accept:* `git diff svsh_branch..HEAD` shows the revision; `npm run check` OK with no
      generated-file change; working tree clean.
- [x] **2. Close the AA holes (M).** Declare every pair in gap 3 as `data-text`, plus
      `primary.color` on `surface.0/50/100`. Confirm the two failures stop generation
      (red), then apply decision A (green) and regenerate. Add a test that pins the new pairs.
      *Accept:* pipeline refuses the old values and passes the new ones; both test suites green.
- [x] **3. Wire semantic buttons (M).** Measure rendered success/danger/warn fills first.
      If Aura's differ from DESIGN.md, emit button overrides from the semantic tokens in
      `emit-preset.ts`. Add a test that mounts each severity and asserts token colors.
      *Accept:* each severity renders its DESIGN.md fill and foreground at ≥4.5:1, confirmed
      in a real browser. If Aura already matches, record that and only add the test.
- [x] **4. Correct the docs (S).** Fix everything in gap 5, and remove the button limitation
      from the original plan's Review if task 3 resolves it.
      *Accept:* every ratio quoted in a note matches its computed value; utility examples
      exist in `tailwind.tokens.ts`.
- [x] **5. Verify (S).** In `tools/token-pipeline`: `npm test`, `npm run check`. In
      `client-vue3`: `eslint .`, `vue-tsc -b && vite build`, full vitest. Tamper with a
      generated file to confirm `--check` still fails.
      *Accept:* all green, negative control fails, evidence recorded below.
- [x] **6. Owner sign-off (HITL, S).** Owner reviews the revised DESIGN.md and the rendered
      button/selected-row result.
      *Accept:* approval comment on #40 covering the revised text and any changed tokens.
- [ ] **7. Close out (S).** Update #33, #40 and #41, which still specify PrimeVue. PR to `svsh_branch`, tick the #40 acceptance criteria, then close
      #40 manually, since `Closes #40` will not fire on this base.
      *Accept:* #40 closed; #41 unblocked.

## Decisions for the owner

**A. How should `text.muted` pass on tinted rows?**
Recommended: darken `text.muted` with a new gray step that measures ≥4.5:1 on both
`surface.100` and `blue.100`. Muted text stays distinct from `text.secondary`, and meta text
stays readable on alt and selected rows. Restricting muted text to white backgrounds would
rely on every screen author remembering the rule. This changes a token, so it falls under
the sign-off in task 6.

**B. Should a CI job run `--check`?**
Recommended: not in this issue. The repo has no `.github` directory, so this would be the
project's first CI and deserves its own issue. Until then the drift gate is run by hand and
the client snapshot test covers token assertions.

**C. What about the `[PrimeUI] license is not configured` notice?**
Tests print it from PrimeVue 5. The original Review treats it as harmless, but this plan has
not checked PrimeVue 5's license terms. Recommended: check them before #41 commits every
screen to this library, tracked separately from this close-out.

## Out of scope

Archetype kit (#41), page restyling, dark tokens, RTL, new Open Design sessions.

## Review

- **Summary:** landed the DESIGN.md revision (`8abc9275`, cherry-pick of `e3e7c9de`); declared 16 more contrast pairs; preset now takes primary, text, highlight and button severity colors from semantic tokens; corrected doc ratios and references.
- **Token changes needing sign-off:** `gray.500` `#6b7280` -> `#5f6775` (so `text.muted` too); `warning.hover` `amber.700` -> `amber.500`, because dark text failed at 3.53:1; new `danger.active`, `success.active`, `warning.active`.
- **Deviations from plan:** decision A approved a new gray step, but PrimeVue's `ColorScale` type rejects an off-ramp `550`, so `gray.500` itself was changed. Same color, no cast, no emitter change. Scope grew to primary, text and highlight because Aura's color scheme was overriding them: PrimeVue primary rendered `#3b82f6`, not the declared `#2563eb`.
- **Impact:** PrimeVue muted text moves from `gray.600` to the lighter `text.muted` token (still AA). No screens exist on this client yet beyond the scaffold.
- **Testing evidence:** tool tsc OK, vitest 15/15; `npm run check` OK; tampered artifact exits 1; new spec fails against the old preset; client eslint, `vue-tsc -b`, `vite build` all exit 0; vitest 41/41. Chromium computed styles: primary 5.17:1, success 5.02:1, danger 4.83:1, warn 5.57:1, all matching DESIGN.md; warn hover `#f59e0b` with `#111827`.
- **Limitations:** Button height renders 28.8px against the 28px rule (5px x 2 padding + 16.8px line + 2px border). DataTable selected-row rendering was checked by ratio only, not in a browser.
- **ADR-0010 (owner decision, 2026-11-01):** PrimeVue replaced by reka-ui + Tailwind after the spike in `spike/40-headless-kit`. Removed `primevue`, `@primeuix/themes`, the preset emitter and generated preset, so the button wiring in task 3 no longer applies; those colors now reach components through Tailwind (`on`, `active`, `hover`). `EHMRS_TOKENS` moved to `tailwind.tokens.ts`. New `h-row` and `h-row-dense` utilities. The toast sink now uses `src/common/AppToaster.vue` on reka-ui Toast, keeping frozen content and the 3000ms duration.
- **After the replacement:** tool vitest 15/15; `npm run check` OK; client eslint 0 errors, `vue-tsc -b`, `vite build` exit 0, vitest 40/40. Chromium, real app bootstrap: success and error toasts show frozen text in token colors, still open at 2.3s and gone by 3.7s, no license badge. Only console error is a missing favicon.
- **Superseded:** the Chromium button results above were measured on PrimeVue. Buttons are not built yet; #41 builds them.
- **Toast behaviour change:** reka-ui pauses the timer while the toast is hovered or the window loses focus, so a toast can stay longer than 3 seconds in those cases.
- **PrimeVue license (decision C findings, primeui.dev, 2026-11-01):** PrimeVue 5 is commercially licensed; PrimeVue 4 and earlier stay MIT with security fixes only. An unlicensed build shows a visible "Invalid PrimeUI License" badge (seen in the dev server), and the vendor says a missing key shows a notice in deployed apps too. Community license excludes government-funded bodies and organizations with 10+ employees. Commercial is $599 per developer until 2026-12-31, then $799. Resolved by ADR-0010.
- **Future:** separate issue for first CI (decision B).
