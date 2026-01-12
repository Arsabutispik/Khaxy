# @repo/database

## 1.0.0

### Major Changes

- [#88](https://github.com/Arsabutispik/Khaxy/pull/88) [`f564a09`](https://github.com/Arsabutispik/Khaxy/commit/f564a0999210cde82f658f86a778f86f042cd6e7) Thanks [@Arsabutispik](https://github.com/Arsabutispik)! - # Refactor database schema and eliminate technical debt

  ## What changed
  - Restructured database schema with normalized table relationships
  - Renamed/removed deprecated columns and tables
  - Updated Prisma models and generated types across all packages
  - Refactored shared utilities (e.g., `logBan`) to reduce code duplication

  ## Why
  - Previous schema had accumulated technical debt and inconsistencies
  - Duplicate logic between event handlers and commands needed consolidation
  - Improved maintainability and type safety across the monorepo

  ## Migration guide

  ### Database

  Run `pnpm db:migrate` to apply schema changes. Existing data may require manual migration scripts depending on your deployment.

  ### Bot (`khaxyrewrite`)
  - Import shared utilities from `src/utils/` instead of inline implementations
  - Update any direct database queries to match new schema field names

  ### Dashboard (`khaxy-dashboard`)
  - Update API routes and server actions to use new database types
  - Review any cached data structures that reference old field names

  ## Breaking changes
  - All packages must be updated together due to shared type dependencies
  - Database schema is incompatible with previous versions
