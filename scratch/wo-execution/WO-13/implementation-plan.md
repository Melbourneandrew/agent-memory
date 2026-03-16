# Implementation Plan: WO-13

**Work Order:** WO-13 — Build Web UI Configuration Management Pages
**Created At (UTC):** 2026-03-16T07:37:47Z

## Summary

WO-13 implements real configuration management pages and server actions for the web app. The approach keeps all reads/writes server-side via the core Configuration components, uses server-action forms for updates, and provides a client-side confirmation dialog for destructive local config reset.

## File and Package Structure

- `nextjs/app/config/page.tsx` (full configuration UI with status alerts and update forms)
- `nextjs/app/config/actions.ts` (update and clear configuration server actions)
- `nextjs/app/config/clear-config-form.tsx` (client confirmation dialog wrapper for clearing local config)
- `nextjs/lib/server/core.ts` (helpers for local config reads and server-side config writes/clears)
- `nextjs/components/ui/alert-dialog.tsx` (shadcn-style AlertDialog primitive)
- `nextjs/components/ui/textarea.tsx` (textarea primitive for future config/memory forms)
- `nextjs/package.json`, `package-lock.json` (Radix alert-dialog dependency)
- `scratch/wo-execution/WO-13/*` (execution artifacts and review evidence)

## Signatures

- `updateConfigurationAction(formData: FormData): Promise<void>`
- `clearConfigurationAction(formData: FormData): Promise<void>`
- `readLocalServerConfiguration(cwd?: string): ConfigurationReadResult`
- `writeServerConfiguration(updates, target?, cwd?): { path: string; values: ConfigurationValues }`
- `clearServerConfiguration(target?, cwd?): { path: string; deleted: boolean }`
- `ClearConfigurationForm(): JSX.Element`

## Control Flow

1. `/config` Server Component reads both local config (`readLocalServerConfiguration`) and effective resolved config (`resolveServerConfiguration`).
2. Update forms submit to `updateConfigurationAction`, which validates inputs, writes local config via `ConfigurationWriter`, revalidates `/config`, and redirects with success/error message.
3. Clear flow opens a client AlertDialog; confirmation submits to `clearConfigurationAction`, which clears local config, revalidates, and redirects with status.
4. Page renders alerts and masked values from query params + local/effective config state.

## Steps

1. **Add config server helpers** — expose local read/write/clear helpers from `lib/server/core.ts`.
2. **Implement config server actions** — replace placeholders in `app/config/actions.ts` with validated update/clear logic.
3. **Build confirmation UX** — create clear-confirmation dialog client component.
4. **Build config page UI** — render masked local values, effective status, update forms, and clear section.
5. **Stabilize feedback messaging** — normalize redirects and query-parameter messaging with URL-safe encoding.
6. **Verify and document** — run lint/build/tests/react-doctor and record findings in WO artifacts.
