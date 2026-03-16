# Agent Memory Web UI

Next.js App Router package for the local Agent Memory web interface.

## Scripts

- `npm run dev --workspace @agent-memory/nextjs` starts the development server.
- `npm run build --workspace @agent-memory/nextjs` creates a production build.
- `npm run start --workspace @agent-memory/nextjs` runs the production server.
- `npm run lint --workspace @agent-memory/nextjs` runs lint checks.

## Structure

- `app/` contains route segments and Server Components.
- `components/ui/` contains local shadcn/ui primitives.
- `lib/server/` contains server-only integration code for `@agent-memory/core`.

## shadcn/ui Usage Patterns

- Add components with `npx shadcn@latest add <component-name>` from `nextjs/`.
- Keep primitive wrappers under `components/ui/` and compose page features in `app/`.
- Prefer shadcn primitives (`Card`, `Button`, `Separator`, etc.) over bespoke one-off styles.
- Keep data-fetching in Server Components and pass only minimal props to Client Components.
- Never import server-only modules (`lib/server/*`) into Client Components.

## Server-Only Core Integration

`lib/server/core.ts` is the entry point for importing `@agent-memory/core` inside the web package.
It uses `server-only` so API-key-dependent logic cannot be imported into browser bundles.

