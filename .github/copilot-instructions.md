# Mercadex Copilot Instructions

## Scope

These instructions apply to the Mercadex workspace. Treat `docs/ADR.md` as the source of truth for architecture and stack decisions unless the user explicitly overrides it.

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

- Treat the current frontend as a static prototype built with HTML, CSS, and Vanilla JavaScript.
- Do not introduce React, Next.js, or other future-phase frontend patterns unless the task explicitly asks for migration work.
- Keep frontend changes consistent with the existing prototype structure and asset layout.

## Code Quality Rules

- Prefer TypeScript-safe, explicit code when working in the backend.
- Validate inputs at the boundary and use structured error handling instead of throwing ad hoc strings.
- Keep functions and modules focused on a single responsibility.
- Add or update tests whenever behavior changes.

## Workflow Rules

- Before finalizing a change, confirm it matches the repo structure and the ADR.
- Use the smallest change set that satisfies the request.
- If a task touches commit or branch guidance, align it with semantic commits and git-flow rather than inventing a new convention.
- If a user request conflicts with the ADR, call out the conflict and follow the user request only when it is explicit.
