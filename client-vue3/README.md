# EHMRS client-vue3

Vue 3 tooling scaffold salvaged from the abandoned `client-vue-3` branch (issue #34).
Tooling only — no UI, services, stores, or schemas. The sanctioned rewrite
(PrimeVue 4 + Tailwind) is specified in `docs/adr/0001`.

## Commands (npm)

- `npm run dev` — Vite dev server (proxies `/api` to `localhost:4050`)
- `npm run build` — `vue-tsc -b` + Vite build
- `npm run test` — vitest (single run)
- `npm run lint` — eslint
