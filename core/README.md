# @agent-memory-cli/core

**Workspace package (not published on its own).** It is bundled into the root [`agent-memory-cli`](https://www.npmjs.com/package/agent-memory-cli) npm release and consumed by the Next.js app at build time.

Shared TypeScript core library for Agent Memory runtime behavior.

## What this package includes

- Strict TypeScript compilation to `dist/` with declaration files
- Jest + ts-jest unit test harness with coverage reporting
- ESLint + Prettier tooling for quality and formatting
- Initial source module layout:
  - `src/config/`
  - `src/backboard/`
  - `src/assistant/`
  - `src/utils/`
- Shared type definitions in `src/types.ts`

## Development workflow

From the repository root:

```bash
npm install
npm run build
npm run test
npm run lint
npm run format
```

Or run commands directly in the package:

```bash
cd core
npm run build
npm run test
npm run lint
```

## Conventions source of truth

Project conventions for testing, review, and building are documented in `.cursor/skills/`.
Those skill documents are the single source of truth for engineering workflow conventions.
