 # CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EHMRS (Electronic Health Management Resource System) is a comprehensive healthcare management system that handles clinical, administrative and financial operations. It follows a modular monolithic architecture with separate client and server applications.

## Architecture

### Client (Vue.js 2.x Frontend)
- **Framework**: Vue 2.6.11 with Vue CLI
- **State Management**: Vuex store with modular structure
- **Routing**: Vue Router with centralized router.js configuration  
- **UI**: Bootstrap Vue components with custom styling
- **Location**: `/client/src/`

Key client directories:
- `src/core/services/store/` - Vuex modules (accounting, procurement, appointments, etc.)
- `src/view/pages/` - Vue page components organized by module
- `src/view/components/` - Reusable Vue components
- `src/router.js` - Centralized routing configuration

### Server (Node.js/TypeScript/Express Backend)
- **Framework**: Express.js with TypeScript
- **Database**: MySQL with Sequelize ORM and TypeScript models
- **Architecture**: Modular structure with domain-driven design
- **Location**: `/server/src/`

Key server directories:
- `src/modules/` - Business logic modules (30+ modules including Accounting, Appointment, Patient, etc.)
- `src/database/models/` - Sequelize TypeScript models
- `src/database/migrations/` - Database migration files
- `src/core/startup/` - Server initialization and configuration

### Module Structure Pattern
Each server module follows this pattern:
- `[module].controller.ts` - HTTP request handlers
- `[module].service.ts` - Business logic
- `[module].repository.ts` - Data access layer
- `[module].routes.ts` - Route definitions
- `validations.ts` - Request validation schemas
- `interfaces/` - TypeScript interfaces
- `services/` - Specialized service classes

## Common Development Commands

### Client Development
```bash
cd client
npm install                    # Install dependencies
npm run serve                  # Start development server
npm run build                  # Build for production  
npm run lint                   # Run ESLint
```

### Server Development  
```bash
cd server
npm install                    # Install dependencies
npm run start:dev              # Start development server (with nodemon)
npm run build                  # Build TypeScript to dist/
npm run start                  # Start production server
npm run test                   # Run Jest tests
npm run migration              # Run database migrations
npm run accounting:init        # Initialize accounting system
```

### Database Operations
- Migrations are located in `server/src/database/migrations/`
- Use `npm run migration` to run pending migrations
- Models are in `server/src/database/models/` with TypeScript definitions

## Key Development Guidelines

### Database Integration
- All models use Sequelize with TypeScript decorators
- Financial periods and accounting data require proper validation
- Use existing migration patterns for schema changes

### Module Development
- Follow the established controller → service → repository pattern
- Place validation logic in dedicated validation files
- Use TypeScript interfaces for type safety
- Financial modules require special attention to data integrity

### Frontend State Management
- Use modular Vuex stores (see existing accounting/procurement modules)
- Follow the established action/mutation/getter pattern
- Route definitions go in the central router.js file

### Testing
- Jest is configured for the server-side testing
- Use `npm run test` to run all tests
- Test files should follow existing patterns

## Database Requirements

- MySQL database required
- Run migrations before development: `npm run migration`
- Accounting system initialization: `npm run accounting:init`

## Development Workflow

1. Install dependencies for both client and server
2. Set up MySQL database and configure connection
3. Run migrations: `cd server && npm run migration`
4. Start development servers:
   - Client: `cd client && npm run serve`
   - Server: `cd server && npm run start:dev`

## Specialized Modules

The codebase includes comprehensive modules for healthcare operations:
- **Accounting**: Complete financial management with journal entries, cost centers, and reporting
- **Appointment**: Scheduling and patient appointment management  
- **Patient**: Patient records and demographic management
- **Clinical modules**: Laboratory, Radiology, Pharmacy, etc.
- **Procurement**: Purchase orders and inventory management
- **General Store**: Inventory and stock management

When working with these modules, maintain consistency with existing patterns and ensure proper data relationships are preserved.