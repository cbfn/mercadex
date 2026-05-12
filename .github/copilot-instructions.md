# Mercadex Copilot Instructions

## Scope

These instructions apply to the Mercadex workspace. Treat `docs/ADR.md` as the source of truth for architecture and stack decisions unless the user explicitly overrides it.
For frontend visual and interaction decisions, treat `docs/DESIGN_SYSTEM.md` as mandatory source of truth.

## Hard Rules

- Use semantic commit messages for every commit, with a clear type and concise scope when relevant.
- Follow git-flow branch naming when creating or naming work branches: use `feature/<short-description>` for new work, `bugfix/<short-description>` for non-production fixes, `hotfix/<short-description>` for urgent production fixes, and `release/<version-or-name>` for release preparation branches.
- Run the relevant tests before every commit. If tests do not exist yet for the touched area, add the smallest useful validation you can.

## Architecture Rules

- Preserve the monolithic modular architecture described in `docs/ADR.md`.
- Keep backend work organized by module and by layer: controllers, services, repositories, entities, dtos, and tests.
- Keep shared logic in `backend/src/shared` and configuration in `backend/src/config`.
- Avoid cross-module coupling unless the ADR or the current task requires it.
- Prefer small, local changes over broad refactors.

## Frontend Rules

- The frontend is Next.js 14 (App Router) with TypeScript and Tailwind CSS, located in `frontend/`.
- Use `"use client"` only for components that require browser APIs or React hooks; keep server components the default.
- Manage state with Zustand in the current frontend architecture. Do not introduce Redux, Context reducers as global store replacements, or TanStack Query unless explicitly requested.
- Restore browser-only state (e.g., `localStorage`) inside `useEffect` after mount to avoid SSR hydration mismatches.
- Follow `docs/DESIGN_SYSTEM.md` for every UI change, including typography, tokens, spacing, and UX writing.
- Keep UI primitives in `frontend/src/shared/ui/` using shadcn-style component patterns and Tailwind utility classes.
- Follow Feature-Sliced Design: `src/features/<name>/components/` for UI, `src/features/<name>/model/` for state/hooks.

## Code Quality Rules

- Prefer TypeScript-safe, explicit code when working in the backend.
- Validate inputs at the boundary and use structured error handling instead of throwing ad hoc strings.
- Keep functions and modules focused on a single responsibility.
- Add or update tests whenever behavior changes.

## Testing Rules

- Structure every test using the **AAA pattern**: **Arrange** (set up data and dependencies), **Act** (invoke the unit under test), **Assert** (verify the outcome). Keep each phase clearly separated with a blank line between them.
- Name test cases as full sentences describing the expected behavior: `it("returns empty array when no products match the filter")`.
- One behavior per test. Do not assert multiple unrelated outcomes in a single `it` block.
- Use `describe` blocks to group related tests by component, hook, or function name.
- Prefer `userEvent` over `fireEvent` for user interaction tests in React Testing Library.
- Mock only external dependencies (APIs, `localStorage`, timers). Do not mock the unit under test itself.
- Keep Arrange setup local to the test. Extract to `beforeEach` only when all tests in the `describe` block share identical setup.
- Cover the happy path, edge cases, and error/empty states at minimum.

## Workflow Rules

- Before finalizing a change, confirm it matches the repo structure and the ADR.
- Use the smallest change set that satisfies the request.
- If a task touches commit or branch guidance, align it with semantic commits and git-flow rather than inventing a new convention.
- If a user request conflicts with the ADR, call out the conflict and follow the user request only when it is explicit.
