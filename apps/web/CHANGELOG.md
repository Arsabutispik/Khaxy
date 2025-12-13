# Changelog

## 1.0.3

### Patch Changes

- [`bbeff14`](https://github.com/Arsabutispik/Khaxy/commit/bbeff1477ab5bddeb36a0950bd63fb617ca64ce4) Thanks [@Arsabutispik](https://github.com/Arsabutispik)! - Fix avatar being invalid by fetching data every 24h

## 1.0.2

### Patch Changes

- [`8b8b09f`](https://github.com/Arsabutispik/Khaxy/commit/8b8b09f888fe6fc991888243011bf13854f5d11c) Thanks [@Arsabutispik](https://github.com/Arsabutispik)! - Update to latest secure next package

## 1.0.1

### Patch Changes

- [`8757263`](https://github.com/Arsabutispik/Khaxy/commit/87572637308f2e97db42798943ced2048654b2b8) Thanks [@Arsabutispik](https://github.com/Arsabutispik)! - Change to changeset from release-it

# [1.0.0](/compare/v0.12.0...web-v1.0.0) (2025-12-12)

- refactor!: migrate project to monorepo and switch to PostgreSQL b6ec323

### Bug Fixes

- add postinstall script to generate prisma client on deployment 908852d
- env variables cf216f2
- env variables 0e1d9c0
- env variables ae3e408
- eslint ci cf97a27
- update .env.example to include database connection details 3cc3e88
- update build script to include database deployment c496daf
- update ecosystem.config.js to correct env_file format b74c507
- update i18next loadPath to use absolute path for locale files d909635
- update i18next loadPath to use absolute path for locale files 7ddd6a8
- update preserve option in ban command to preserve-messages 01ce2bc
- update README to correct link for environment variables section 634f5c1
- update release command to specify environment file for release-it 172991a
- update release command to use dotenv with release-it f98f9b2

### Features

- add .env.example to root and ecosystem.config.js for bot and web app configuration e5452e7
- add comprehensive README for Khaxy bot and web dashboard 91beb11
- add dotenv-cli dependency for environment variable management 5d7096a
- add GitHub Actions workflow for bot deployment 7a92aa8
- add initial database integration and configuration files a21b7dc
- add release-it configuration for automated releases 2e8173c
- enable manual triggering for bot deployment workflow 18f254f
- rename CI configuration file and enhance deployment workflow 4b5f480
- update .env.example and README for improved environment variable setup 6d2785b

### BREAKING CHANGES

- This migration restructures the entire codebase into a Monorepo, moves the database from SQLite to PostgreSQL, and changes the build pipeline.

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

- add logging for member fetch failures and implement guild info endpoint c1dc4d7
- clean up cached webhook on deletion event c89e21c
- database 6c317e6
- enhance error handling and logging in DiscordTransport 7e55d54
- improve webhook handling and configuration mapping a40832b
- locales 2d4c412
- logs and database 6b3ecd2
- serverside logic for database fix 0c5f8a2
- typings b01b4b8
- update message deletion logic to log messages with attachments (#81) d870787, closes #81
- Update returnWebhook to be more consistent, hopefully (#73) 5e121fc, closes #73
- update server listen host to allow external connections 3db33e7
- Use cache and log if any errors occur 2f8f63a

### Features

- add Fastify API server for dashboard integration with bot routes (#77) ddb04a3, closes #77
- add roles command to manage user roles (#74) 9150bd6, closes #74

# 0.11.0 (2025-10-10)

### Bug Fixes

- remove unnecessary error handling for message components 63c112c

# 0.10.0 (2025-10-10)

# 0.9.0 (2025-10-06)

### Bug Fixes

- embeds being duplicate 923c853
- fix all channels triggering a perm update 4cce7d3

### Features

- add guild logs 728e5a8
- add thread logs af9297c
- add webhook logs 2c5bca0
