# React 19.x Enterprise Banking App

Working implementation companion to the
[React 19.x Enterprise Documentation Suite](../react%20documentations/README.md).

## Quick Start

```bash
git clone <repo-url>
cd react-enterprise-companion
npm install
npm run dev          # Start dev server at http://localhost:5173
```

## Available Scripts

| Command                   | Description                         |
| ------------------------- | ----------------------------------- |
| `npm run dev`             | Start development server            |
| `npm run build`           | Production build                    |
| `npm run preview`         | Preview production build            |
| `npm test`                | Run unit/integration tests (Vitest) |
| `npm run test:watch`      | Tests in watch mode                 |
| `npm run lint`            | ESLint check                        |
| `npm run format`          | Prettier format all source files    |
| `npm run format:check`    | Check formatting without writing    |
| `npm run storybook`       | Launch Storybook component gallery  |
| `npm run build-storybook` | Build static Storybook              |

## Feature Modules

| Module        | Description                        | Docs                |
| ------------- | ---------------------------------- | ------------------- |
| **accounts**  | Account list, detail, transactions | Docs 03, 06, 07, 08 |
| **auth**      | JWT login, route guards, RBAC      | Docs 05, 06, 08, 09 |
| **payments**  | Bill payment wizard (capstone)     | Doc 13              |
| **transfers** | Fund transfer wizard               | Docs 04, 06, 08     |
| **audit**     | Audit trail viewer                 | Doc 14              |

## Architecture

```
src/
├── api/           Axios client + auth interceptors
├── components/    Shared UI (Button, Spinner, FormField, Badge, ErrorBoundary, RequireAuth)
├── features/      Feature-slice modules (accounts, auth, payments, transfers, audit)
├── hooks/         Shared hooks (usePermission, useFeatureFlag)
├── i18n/          IntlProvider + 3 locales (en-US, es-MX, ar-SA)
├── mocks/         MSW handlers (browser + server)
├── pages/         Page components (Dashboard, Accounts, Transfers, Audit)
├── stores/        Zustand stores (auth, locale, notifications, theme)
└── styles/        Global CSS + Tailwind directives
```

## Documentation Mapping

Every file in this repo maps to a section in the documentation suite.
See [COMPANION_REPO.md](../react%20documentations/COMPANION_REPO.md) for the full mapping.

## Tech Stack

React 19.x · TypeScript 5.x · Vite 7.x · Tailwind CSS 4 · Zustand 5.x ·
TanStack Query 5.x · React Hook Form 7.x · Zod 4.x · React Router 7.x ·
Vitest 4.x · MSW 2.x · Playwright 1.58.x · Storybook 10.x · ESLint 10.x ·
Prettier 3.x · Husky 9.x · lint-staged 16.x

## Current Status

- **TypeScript**: 0 errors
- **Build**: Success
- **Tests**: 56/56 pass
- **Storybook**: 6 stories (Button, Spinner, FormField, ThemeToggle, AccountCard)
- **Formatting**: Prettier configured with pre-commit hook
- **npm audit**: 8 high (upstream `typescript-eslint` transitive `minimatch` — awaiting upstream fix)
