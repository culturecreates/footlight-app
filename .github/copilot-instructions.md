# Footlight App Copilot Instructions

## Purpose

This repository is the frontend for Footlight CMS. It is a React single-page application used to manage calendar-scoped data for events, places, people, organizations, taxonomies, users, and system updates.

Use these instructions as the default system context when generating or editing code in this repo.

## Repository Snapshot

- Package manager: npm (lockfile present: package-lock.json)
- Runtime: Node.js >= 22.15.0
- Module type: ESM (package.json has type: module)
- Build tool: Vite 7
- Main frontend stack: React 18 + React Router 6 + Redux Toolkit + RTK Query + Ant Design 4
- Localization: i18next + react-i18next (English and French)

## Language and File-Type Profile

Based on tracked files in git:

- JavaScript: 243 .js files
- JSX: 146 .jsx files
- CSS: 119 .css files
- SVG assets: 13 files
- JSON: 9 files
- YAML workflow/config files: 6 files

Guidance:

- Prefer JavaScript/JSX (do not introduce TypeScript unless explicitly requested).
- Match existing style and patterns in nearby files.

## Top-Level Structure

- src/: application source code
- public/: static public assets
- build/: Vite build output (generated)
- .github/workflows/: CI/CD and deployment workflows
- .husky/: commit-time and push-time hooks

## Source Structure (src)

- src/App.jsx: app shell with RouterProvider
- src/index.jsx: app bootstrap, Redux Provider, PersistGate, i18n initialization
- src/router/: route definitions (createBrowserRouter)
- src/pages/: route-level feature pages
- src/components/: shared and feature UI components
- src/redux/: Redux store and reducers
- src/services/: RTK Query API slices
- src/utils/: shared utilities (includes API base query with auth refresh)
- src/constants/: route names and domain constants
- src/config/i18n.js: i18n setup and language bootstrapping
- src/locales/en and src/locales/fr: translation resources
- src/layout/: shared layout and route protection wrappers
- src/hooks/: reusable hooks

## Architectural Conventions

### Routing

- Routes are centralized in src/router/index.js and use createBrowserRouter.
- Route path constants are in src/constants/pathName.js.
- Most dashboard routes are nested under /dashboard and include calendarId context.
- When adding new screens, wire them through PathName constants first, then router entries.

### State Management

- Global state uses Redux Toolkit and redux-persist.
- Store setup is in src/redux/store.js.
- Persist only slices already intended for persistence; do not persist API caches.
- Existing persisted slices include user, interfaceLanguage, selectedCalendar, errors, and languageLiteral.

### API Layer

- API slices are in src/services/\* and built with RTK Query createApi.
- Shared base query is src/utils/services.js (baseQueryWithReauth).
- Base query behavior includes:
  - Bearer token injection from Redux state/cookies
  - Refresh-token retry using async-mutex to prevent race conditions
  - Session-expired redirect flow to login
  - Global handling for 400/401/403/404/409/500/502 and fetch errors
- New API endpoints should follow existing service slice patterns and tag invalidation conventions.

### Internationalization

- i18n is initialized in src/config/i18n.js.
- Supported languages: en and fr.
- Interface language is derived from cookie/state; fallback is en.
- Do not hardcode user-facing strings when translation keys should be used.

### UI and Components

- Reusable components are organized under src/components by feature/control type.
- Ant Design is a core UI dependency; align with existing usage before introducing new UI libraries.
- Keep changes consistent with existing styling approach (CSS files alongside components/features).

## Key Dependency Clusters

- Core framework: react, react-dom, react-router-dom
- State/data: @reduxjs/toolkit, react-redux, redux-persist
- UI and interaction: antd, react-dnd, @dnd-kit/\*, react-colorful, react-easy-crop, react-quill
- Localization: i18next, react-i18next
- Date/time: moment, moment-timezone, rc-calendar, rc-year-calendar
- Maps: @vis.gl/react-google-maps
- Utilities: js-cookie, async-mutex, localforage, immutability-helper
- Tooling: vite, @vitejs/plugin-react, vite-plugin-svgr, vite-plugin-eslint, eslint, prettier, husky, lint-staged, commitlint

## Environment and Runtime Notes

- Environment files exist for develop/staging/production modes.
- Expected frontend env vars include:
  - VITE_APP_API_URL
  - VITE_APP_DEEPL_URL
  - VITE_APP_HELP_EN_URL
  - VITE_APP_HELP_FR_URL
  - VITE_APP_FEATURE_FLAG_QUICK_CREATE_ORGANIZATION
  - VITE_APP_ENV
- Some workflows append Google Maps env vars dynamically in CI.

## Scripts and Developer Workflow

Primary npm scripts:

- start:staging
- start:production
- build:staging
- build:production
- lint
- lint:fix
- format

Pre-commit and push quality gates:

- pre-commit: lint-staged (eslint --fix + prettier)
- commit-msg: commitlint conventional commits
- pre-push: branch naming validation

## Testing and Validation Reality

- Unit test footprint is currently small (for example src/App.test.js).
- Cypress execution is handled mainly via GitHub Actions workflow and containerized test setup, not an in-repo cypress directory.
- For code changes, prefer:
  - lint for broad safety
  - targeted manual validation on impacted routes/flows
  - focused unit tests when touching pure utility logic

## CI/CD and Deployment Context

- GitHub workflows include:
  - staging S3 build/deploy on develop branch
  - production build/deploy variants
  - docker image publish workflows
  - containerized Cypress regression workflow
- Dockerfile starts the app using npm run start:staging.

## Copilot Working Rules for This Repo

When implementing changes:

- Preserve JavaScript/JSX stack and existing architecture unless asked otherwise.
- Reuse existing modules before creating new abstractions.
- For new routes, update PathName constants and router definitions together.
- For API work, prefer extending existing RTK Query slices and base query behavior.
- Preserve calendar-scoped behavior across routing, queries, and mutations.
- Keep i18n in sync for user-facing copy changes (en and fr where applicable).
- Run lint on touched files or full lint before finalizing substantial edits.
- Avoid broad refactors unless explicitly requested.

## Known Hotspots and Cautions

- Add-event field state has had race-prone merge issues in the past.
- Avoid full-array overwrites from concurrent effects in async add-event flows.
- Prefer composable slice-state + derived union patterns where multiple async writers exist.

## Notes for Future Maintenance

- README still references create-react-app commands in places; actual tooling is Vite-based.
- Keep documentation and scripts aligned when updating build/dev behavior.
