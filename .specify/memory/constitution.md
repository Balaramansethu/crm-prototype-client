<!--
SYNC IMPACT REPORT
Version change: 1.0.0 (clarifications resolved before first use; no version bump)
Modified principles:
- Explicit Interfaces & Prop Contracts: TypeScript not adopted; prop-types is SHOULD for existing components, MUST for new public components
- Test-First & Coverage: test tool set to Node's built-in test runner (`node --test`, `node:test`); no fixed coverage number, every change carries tests for what it changed
- Integration Testing: required once CI exists; Playwright is the chosen tool
Added sections:
- None
Removed sections:
- None
Resolved clarifications:
- Adopt TypeScript: No (codebase is JSX/JS, no .ts files)
- E2E framework: Playwright, when E2E tests are added
- CI provider: GitHub Actions, when CI is added (none today; deploys to Vercel)
- Coverage threshold: none fixed; every change includes tests for the behaviour it changes
- Bundler/build tool: Vite (already in use)
- Package manager: npm (package-lock.json present)
- Approvers for constitution changes: 1 maintainer (repository owner)
- Storybook: not required
Follow-up TODOs:
- Add an npm `test` script that runs `node --test` (no test runner script exists today)
- Add GitHub Actions CI running lint, build and unit tests
-->

# ReactJS (JSX) Project Constitution

## Core Principles

### Component-First (NON-NEGOTIABLE)
All user-facing functionality MUST be implemented as focused, reusable React components written in JSX. Components MUST have a single responsibility, a minimal public surface, and be small enough to reason about and test in isolation.

Rationale: Component-first development maximizes reuse, testability, and maintainability across the UI surface.

### Explicit Interfaces & Prop Contracts
Public component interfaces (props and events) MUST be explicit and documented. The project does not adopt TypeScript. New public components MUST include runtime prop validation (`prop-types`) and a documented example; existing components SHOULD gain it when they are next changed.

Rationale: Explicit contracts prevent regressions and make components safe to compose and reuse, without forcing a rewrite of existing code.

### Test-First & Coverage (NON-NEGOTIABLE)
Every bug fix, new component or feature MUST include automated tests, written with Node's built-in test runner (`node:test`, run by `node --test`), that verify the behaviour it adds or changes. Unit tests are required for component and utility logic; snapshot tests alone are insufficient. No fixed coverage percentage is enforced.

Rationale: Tests are the project's primary safety net and enable safe refactors and continuous delivery.

### Integration Testing
Once CI exists, critical user flows (authentication, navigation, form submission, data persistence) MUST be covered by end-to-end tests written with Playwright and run in CI. Test suites MUST be reliable and deterministic.

Rationale: Integration tests validate the system-level behaviour that unit tests cannot guarantee.

### Observability, Versioning & Simplicity
- The UI MUST surface actionable errors and recover gracefully where possible (use error boundaries and user-friendly messages).
- Public packages/components MUST follow semantic versioning for releases consumed by other projects.
- Simplicity is a first-order value: prefer the simplest implementation that satisfies requirements; avoid premature abstraction.

Rationale: Observability and disciplined versioning reduce user impact from regressions; simplicity reduces maintenance cost.

## Technology Constraints
This project targets React as the UI framework with JSX as the source format. All UI code MUST be authored in JSX (JavaScript, not TypeScript).

Toolchain:
- Node.js LTS for local development and CI.
- Vite as the bundler and dev server.
- npm as the package manager (`package-lock.json` is committed).
- Node's built-in test runner (`node --test`) for unit tests; Playwright for end-to-end tests.
- Modern ECMAScript features are allowed/transpiled as needed.

## Development Workflow
- Pull requests MUST include a concise description and tests demonstrating the behaviour.
- All checks (lint, build, unit tests) MUST pass before merge; once CI exists (GitHub Actions), they MUST pass in CI.
- Code review MUST be performed by at least one project maintainer; the approver MUST verify tests and compliance with these principles.
- Changes that alter public component contracts MUST include a migration note and a version bump according to the governance policy below.
- Storybook or another component explorer is not required.

## Governance
The constitution is the primary source of governance for development practices in this project. Amendments to the constitution MUST follow the process below.

Amendment procedure:
- Propose an amendment by submitting a pull request that edits `./.specify/memory/constitution.md` and includes: a clear rationale, the exact text change, migration guidance if the change affects implementations, and a short impact summary.
- Label the PR with `constitution` or `governance`.
- Changes to the constitution require approval by one maintainer (the repository owner).

Versioning policy:
- MAJOR version when a principle is removed or redefined in a backwards-incompatible way.
- MINOR version when a new principle or material new guidance is added.
- PATCH version for clarifications, wording changes, and non-semantic fixes.

Compliance and review:
- The project SHOULD perform periodic reviews of implemented practices for compliance with the constitution (e.g., during quarterly retrospectives).

**Version**: 1.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29