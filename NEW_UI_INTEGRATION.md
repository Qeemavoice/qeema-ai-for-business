# New Qeema UI Integration

Branch: `feat/new-design-integration`

## Goal
Integrate the React/Vite Qeema AI design from `qeemavoice2/Qeemavoice2` into the existing Laravel/Vue Stage 2 application without replacing the production backend.

## Integration strategy
1. Keep Laravel 8 as the source of truth for authentication, users, orders, payments, and production business logic.
2. Use the React design as the new presentation layer.
3. Replace prototype APIs and in-memory data with Laravel endpoints incrementally.
4. Keep the legacy Vue UI available during migration.
5. Deploy this branch to a dedicated preview environment before merging to `main`.

## Current state
- New UI source attached under `new-ui` as a Git submodule.
- Production `main` is untouched.
- Preview deployment is pending hosting permission.
