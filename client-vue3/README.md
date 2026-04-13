# EHMRS Client Vue 3

EHMRS (Electronic Health Management Resource System) - Vue 3 Client

## Tech Stack

- **Framework**: Vue 3.5+ with Composition API (`<script setup>`)
- **Build Tool**: Vite 5.x
- **Language**: TypeScript 5.x (strict mode)
- **State Management**: Pinia 2.x
- **Routing**: Vue Router 4.x
- **HTTP Client**: Axios 1.x
- **Styling**: Tailwind CSS + SCSS
- **Testing**: Vitest 1.x

## Project Structure

```
client-vue3/
├── src/
│   ├── assets/          # SCSS, images, fonts
│   ├── components/      # Reusable components
│   ├── composables/     # Composable functions
│   ├── layouts/         # Page layouts
│   ├── pages/           # Page components
│   ├── router/          # Router configuration
│   ├── services/        # API clients
│   ├── stores/          # Pinia stores
│   ├── types/           # TypeScript types (symlink to root types/)
│   ├── utils/           # Utility functions
│   ├── __tests__/       # Test files
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry
├── docs/                # Documentation (symlink to root docs/)
├── package.json
└── vite.config.ts
```

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Development

```bash
# Start development server
npm run dev

# Server runs at http://localhost:3000
# API proxy configured to http://localhost:8080
```

### Build

```bash
# Type check and build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Format code with Prettier
npm run format
```

## Environment Variables

```env
# .env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=EHMRS
VITE_APP_VERSION=1.0.0

# .env.production
VITE_API_BASE_URL=https://api.ehmrs.com
VITE_APP_ENV=production
```

## Key Conventions

### TypeScript

- Strict mode enabled
- No `any` types allowed
- All props and emits must be typed
- Use types from `types/` folder (shared with server)

### Component Syntax

```vue
<script setup lang="ts">
// Use Composition API with <script setup>
interface Props {
  user: User
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

interface Emits {
  (e: 'edit', id: number): void
  (e: 'delete', id: number): void
}

const emit = defineEmits<Emits>()
</script>
```

### API Data

- Use snake_case for API fields (matches server)
- IDs are `number` type (not string)
- Import types from `@/types`

### State Management

- Use Pinia stores
- Type all state, getters, and actions
- Use composables for reusable logic

## Phase Status

### Phase 1: Core Infrastructure ✅ IN PROGRESS

- [x] Project initialization
- [x] Configuration files
- [x] API client layer
- [x] Authentication store
- [x] Router with guards
- [x] Login page
- [x] Dashboard page (placeholder)
- [x] Base components
- [x] Layouts
- [ ] Unit tests
- [ ] TypeScript compilation
- [ ] ESLint/Prettier configuration

### Upcoming Phases

- **Phase 2**: Patient Management Module
- **Phase 3**: Appointments Module
- **Phase 4**: Visits Module
- **Phase 5**: Employee Module

## Documentation

- [Architecture](../../docs/ARCHITECTURE.md)
- [Design System](../../docs/CLIENT_DESIGN_SYSTEM.md)
- [API Conventions](../../docs/API_CONVENTIONS.md)
- [Page Specs](../../docs/CLIENT_PAGE_SPECS.md)
- [Roadmap](../../docs/CLIENT_ROADMAP.md)

## License

Private - EHMRS Project
