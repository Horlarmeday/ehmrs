# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Vue 2 (Vue CLI 4), Vue Router, Vuex, Axios, BootstrapVue, VeeValidate v2, dayjs, ApexCharts, Metronic-based layout utilities.
- Entry: src/main.js wires router, Vuex store, global plugins, and mounts App.vue.
- Dev server: vue.config.js proxies /api and /static to VUE_APP_BACKEND_URL.
- State management: src/core/services/store is the canonical Vuex store with many domain modules (auth, patient, pharmacy, etc.), aggregated in src/core/services/store/index.js.
- HTTP: src/axios.js centralizes Axios config, baseURL = '/api', Authorization from localStorage 'user_token', NProgress, and global success/error notifications.

Common commands
- Install dependencies (Yarn is used in README):
  - yarn install
- Start development server (history mode, default host localhost):
  - Ensure backend proxy target is set: export VUE_APP_BACKEND_URL to your backend URL.
    - fish: set -x VUE_APP_BACKEND_URL http://localhost:8000
    - bash/zsh: export VUE_APP_BACKEND_URL=http://localhost:8000
  - yarn serve
- Build for production (outputs to dist/):
  - yarn build
- Lint:
  - Check: yarn lint
  - Auto-fix: yarn run __eslint_fix
- RTL styles (generates RTL CSS assets under src/assets/css):
  - yarn rtl
- Tests:
  - No test runner is configured (no test script in package.json).

High-level architecture and structure
- Application shell and layout
  - src/view/layout/Layout.vue composes the core UI shell (Header, Aside, Footer, StickyToolbar, ScrollTop) and renders the current page via <router-view />.
  - Layout and UI config/state is managed by Vuex modules under src/core/services/store (e.g., htmlclass.module.js, config.module.js, breadcrumbs.module.js). Layout.vue uses Vuex getters to drive loader visibility, container fluidity, etc.

- Routing (src/router.js)
  - Router runs in history mode and redirects '/' to '/dashboard' if authenticated or '/auth/login' otherwise.
  - Auth is inferred from authStore.state.token; many routes are lazy-loaded via dynamic imports from src/view/pages/... and are composed under the main Layout route with meta.requiresAuth.

- State management (Vuex)
  - The root store is defined in src/core/services/store/index.js with strict mode enabled in non-production.
  - Domain modules live in src/core/services/store/<domain>/ (e.g., patient, pharmacy, laboratory, etc.) and are registered in the root store for feature-scoped state/actions.

- HTTP and API
  - src/axios.js sets axios.defaults.baseURL = '/api' so all requests are routed through the devServer proxy configured in vue.config.js.
  - A Bearer token is read from localStorage key 'user_token' and attached to Authorization headers. 401 responses trigger auth/logout; 2xx statuses like 201/204 notify via notifySuccess; errors funnel through notifyError.
  - NProgress is used to indicate request progress (color customized at request start), and completes after responses.

- Plugins and utilities (src/core/plugins)
  - BootstrapVue, ApexCharts, PerfectScrollbar, PortalVue, Highlight.js, Inline SVG, Metronic integration, and a custom dayjs plugin (exposes this.$dayjs and a dayjs filter with helpers like add/subtract/diff/calendar).

- Internationalization
  - i18n.service.js (src/core/services/i18n.service.js) stores the active language in localStorage and defines available languages and their flags. Vue I18n is present as a dependency but not fully wired in main.js in this snapshot.

- Aliases and tooling
  - '@' resolves to src (Vue CLI default, used throughout imports like '@/core/...').
  - vue$ is aliased to 'vue/dist/vue.runtime.esm.js' in vue.config.js.
  - ESLint is configured via .eslintrc.js (extends plugin:vue/essential and @vue/prettier). .eslintignore excludes node_modules/ and src/assets.

Environment and configuration
- Dev proxy: vue.config.js proxies '/api' and '/static' to the value of VUE_APP_BACKEND_URL. Set this env var before 'yarn serve' to target a backend (e.g., http://localhost:8000).
- Build output: dist/ (default Vue CLI output).
- Secrets: Do not commit or print secrets. Use environment variables (e.g., VUE_APP_*). The Authorization token is read from localStorage 'user_token'.

Key references
- src/main.js – App bootstrap and plugin registration
- src/router.js – Route table and auth redirect logic
- src/core/services/store/index.js – Vuex root store and module registration
- src/axios.js – Axios defaults, interceptors, and notifications
- src/core/plugins/* – Third-party and custom plugin integration
- src/view/layout/Layout.vue – Application shell and content mount point
- vue.config.js – Proxy and webpack setup
- README.md – Basic Yarn-based setup (install, serve, build, lint)
