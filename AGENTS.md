## Repository Guide: nextjs-boilerplate-with-better-auth

Use this file as the primary project instruction source for all agent work in this repository.

## Scope

- Apply these conventions to all code changes in this repository.
- Prefer small, focused edits that preserve current architecture.
- Do not refactor unrelated files unless explicitly requested.

## Tech Stack

- Framework: Next.js 16 (App Router) with React 19 and TypeScript.
- Styling: Tailwind CSS 4 + shadcn/base-ui style components.
- UI Utilities: class-variance-authority, clsx, tailwind-merge.
- Icons: Prefer @tabler/icons-react; lucide-react is also present.
- Auth: better-auth with email/password + verification/reset flow.
- Data: Prisma 7 with generated client at `src/lib/generated/prisma`.
- Database: PostgreSQL; adapter auto-selects Neon vs standard PG in `src/lib/db.ts`.
- Feedback: sonner toasts.
- Forms: react-hook-form + zod resolvers.
- Testing: Vitest.

## Folder Structure and Routing

- Root layout and global providers live in `src/app/layout.tsx`.
- Public landing page is `src/app/page.tsx`.
- Auth pages live under `src/app/(auth)`.
- Tools area lives under `src/app/(tools)`.
- Tool pages must be created in `src/app/(tools)/tools/<tool-slug>/page.tsx`.
- Auth API route is `src/app/api/auth/[...all]/route.ts`.
- Route protection/redirect logic is in `src/proxy.ts`.

## UI and Component Conventions

- Reuse existing components before creating new ones.
- First preference: `src/components/ui/*`.
- Second preference: shared components in `src/components/*`.
- Keep spacing, typography, card structure, and control sizing consistent with existing tools pages.
- Preserve mobile + desktop responsiveness for every page.
- Keep icon usage meaningful and consistent with tool purpose.

## Styling and CSS Conventions

- Global tokens and theme variables are defined in `src/app/globals.css`.
- Respect existing OKLCH token system and semantic variables (`--background`, `--primary`, etc.).
- Use utility classes and existing tokens; avoid hard-coded one-off colors unless required.
- Respect existing layout heights and header token `--header-height`.
- Maintain current dark mode behavior through `next-themes` and tokenized styles.

## Tool Page Pattern (Mandatory Default)

Use `src/app/(tools)/tools/json-formatter/page.tsx` as the baseline pattern unless asked otherwise.

- Client component (`'use client'`) for browser-only utilities.
- Structure:
  - Heading + description block.
  - Two-card grid (Input and Output).
  - Clear action row (upload/reset/copy/download as needed).
  - Error state and success feedback.
- Card conventions:
  - `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`.
  - Input editors typically use `Textarea` with monospaced text for code/text utilities.
  - Output area should be clearly separated and copy-friendly.
- Feedback conventions:
  - Use `toast.success` and `toast.error` from sonner.
- Prefer client-side processing unless server-side is required.

## Tools Registry and Sidebar Conventions

- Register every tool in `src/lib/tools-registry.ts`.
- `ToolDefinition` fields must be complete and meaningful:
  - `title`, `slug`, `url`, `description`, `tags`, `icon`, `available`, `category`.
- Use existing `ToolCategory` values and keep naming aligned to current use-case groups.
- Set `available: false` for planned tools that are not implemented.
- Keep tags practical for sidebar search (name + tag filtering is used in sidebar).
- Sidebar grouping/search behavior lives in `src/components/dashboard-sidebar.tsx`; preserve it when adding tools.

## Auth and Security Conventions

- Use better-auth primitives from `src/lib/auth.ts` and `src/lib/auth-client.ts`.
- Keep auth flow behavior intact:
  - email verification required,
  - sign-in/up routes handled in `(auth)`,
  - tools routes protected in `src/proxy.ts`.
- Do not bypass verification redirect behavior without explicit request.

## Data and Prisma Conventions

- Prisma schema is source-of-truth in `prisma/schema.prisma`.
- Generated client path must remain `src/lib/generated/prisma` unless explicitly migrating.
- Use existing adapter selection strategy in `src/lib/db.ts` (Neon vs standard PG).
- Avoid direct schema shape changes unless task requires them.

## Coding Standards

- Use explicit types where they improve readability and safety.
- Prefer clear names over abbreviations.
- Keep functions/components single-purpose.
- Avoid adding dependencies when existing stack already solves the problem.
- Add comments only when logic is non-obvious.

## Library and Dependency Guidelines

- **Prefer production-grade libraries over custom implementations** — do not reinvent the wheel.
  - For formatting: use `sql-formatter`, `yaml`, `xml-formatter` instead of custom parsers.
  - For encoding/decoding: use built-in Web APIs (`btoa`, `atob`, `encodeURIComponent`, `decodeURIComponent`, etc.) when available.
  - For validation: use `ajv` for JSON Schema, `zod` for form validation.
  - For icons: prefer `@tabler/icons-react`; use `lucide-react` as fallback.
- **Minimize custom code** — keep implementations simple, clear, and easy to understand.
- **Avoid complexity** — utility tools should process data efficiently on the client side without over-engineering.
- **Reuse patterns** — follow existing tool implementations (Base64 Encoder, JSON Formatter, etc.) as templates rather than creating novel patterns.

## Tool Implementation Guidelines

- **Simple and clear logic** — encoder/decoder, formatter, and validator tools should have minimal code complexity.
- **Client-side processing** — prefer processing in the browser for utility tools unless server computation is required.
- **Minimal error handling** — use try-catch blocks with user-friendly error messages via toast; no silent failures.
- **Standard UI pattern** — follow the two-card layout (Input/Output) with mode selectors and action buttons.
- **No unnecessary features** — add only controls that directly serve the tool's purpose (e.g., encode/decode mode, input type selectors).

## Quality Gates Before Finishing

- Check changed files for TypeScript/lint problems.
- Ensure no regressions in route/layout structure.
- Ensure links, icons, and registry entries are consistent.
- Ensure UI changes are responsive and visually aligned with existing pages.

## Editing Discipline

- Do not revert user changes outside task scope.
- Do not touch unrelated files.
- Keep diffs review-friendly and minimal.
