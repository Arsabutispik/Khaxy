# Changelog

# [1.0.0](/compare/v0.12.0...bot-v1.0.0) (2025-12-06)


* refactor!: migrate project to monorepo and switch to PostgreSQL b6ec323


### Features

* add initial database integration and configuration files a21b7dc


### BREAKING CHANGES

* This migration restructures the entire codebase into a Monorepo, moves the database from SQLite to PostgreSQL, and changes the build pipeline.

Monorepo Structure:
- Converted project to pnpm workspaces with Turborepo
- Moved Discord bot to `apps/bot`
- Moved Next.js dashboard to `apps/web`
- Created `packages/database` for shared Prisma types and client

Database & Backend:
- REMOVED: SQLite and `better-sqlite3` native bindings
- ADDED: PostgreSQL support via `pg` driver
- Unified database schema access via `@repo/database` package
- Updated Auth.js (Better Auth) to use the shared Postgres connection

Dashboard Features:
- feat: Added `DiscordRoleSelect` component with role colors and sorting
- fix: Added bottom padding to forms to prevent "Unsaved Changes" bar overlap
- fix: Resolved type safety issues in Moderation Config form

Config:
- Updated `.gitignore` to strictly ignore .env files
- Configured `turbo.json` for build/dev pipelines
- Configured `tsconfig.json` paths for cleaner imports



# 0.12.0 (2025-11-30)


### Bug Fixes

* add logging for member fetch failures and implement guild info endpoint c1dc4d7
* clean up cached webhook on deletion event c89e21c
* database 6c317e6
* enhance error handling and logging in DiscordTransport 7e55d54
* improve webhook handling and configuration mapping a40832b
* locales 2d4c412
* logs and database 6b3ecd2
* serverside logic for database fix 0c5f8a2
* typings b01b4b8
* update message deletion logic to log messages with attachments (#81) d870787, closes #81
* Update returnWebhook to be more consistent, hopefully (#73) 5e121fc, closes #73
* update server listen host to allow external connections 3db33e7
* Use cache and log if any errors occur 2f8f63a


### Features

* add Fastify API server for dashboard integration with bot routes (#77) ddb04a3, closes #77
* add roles command to manage user roles (#74) 9150bd6, closes #74



# 0.11.0 (2025-10-10)


### Bug Fixes

* remove unnecessary error handling for message components 63c112c



# 0.10.0 (2025-10-10)



# 0.9.0 (2025-10-06)


### Bug Fixes

* embeds being duplicate 923c853
* fix all channels triggering a perm update 4cce7d3


### Features

* add guild logs 728e5a8
* add thread logs af9297c
* add webhook logs 2c5bca0
