# Khaxy Bot

The Discord bot component of the Khaxy monorepo. A feature-rich moderation and utility bot built with Discord.js v14 and TypeScript.

## ✨ Features

- **Moderation Commands** - Ban, kick, mute, warn, timeout, and more
- **Modmail System** - Private communication between users and staff
- **Auto-Moderation** - Automated content filtering and enforcement
- **Logging** - Comprehensive server event logging
- **Welcome/Leave Messages** - Customizable member join/leave notifications
- **Role Management** - Auto-roles, role rewards, and more
- **Internationalization** - Full support for English and Turkish

## 🚀 Self-Hosting

### Option 1: Docker / Podman (Recommended)

The easiest way to run the bot:

```bash
# From the monorepo root
cd Khaxy

# Create environment file
cp .env.example .env
# Edit .env with your Discord token and settings

# Start with Docker
docker compose up -d

# Or with Podman
podman compose up -d

# View logs
docker compose logs -f bot
```

#### Using Pre-built Image

```bash
# Pull from GitHub Container Registry
docker pull ghcr.io/arsabutispik/khaxy-bot:latest
```

#### Environment Variables for Docker

```env
# Required
DISCORD_BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_client_id

# Optional (defaults provided)
POSTGRES_USER=khaxy
POSTGRES_PASSWORD=khaxy_password
POSTGRES_DB=khaxy
```

### Option 2: Manual Setup

#### Prerequisites

- [Node.js](https://nodejs.org/) v22.0.0 or higher
- [pnpm](https://pnpm.io/) package manager
- [PostgreSQL](https://www.postgresql.org/) database
- A [Discord Application](https://discord.com/developers/applications) with a bot token

#### Setup

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone https://github.com/Arsabutispik/Khaxy.git
   cd Khaxy
   ```

2. **Install dependencies** from the root of the monorepo
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   All environment variables are configured in a single `.env` file at the **root** of the monorepo. See the [root README](../../README.md#-environment-variables) for the full list of required variables.
   
   The bot uses these variables:

   | Variable           | Description                          |
   |--------------------|--------------------------------------|
   | `TOKEN`            | Discord bot token                    |
   | `GUILD_ID`         | Guild ID for development/testing     |
   | `CLIENT_ID`        | Discord application client ID        |
   | `DOCS_URL`         | URL for bot documentation            |
   | `DATABASE_URL`     | PostgreSQL connection string         |
   | `INTERNAL_API_KEY` | Secret key for bot-web communication |

4. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

5. **Configure the bot**
   
   Copy the example configuration file:
   ```bash
   cd apps/bot
   cp config.example.toml config.toml
   ```
   
   Edit `config.toml` with your settings:
   - Custom emoji IDs (or use the fallback emojis)
   - Bot activity messages
   - Logging configuration (webhook, file, console)

6. **Deploy slash commands**
   ```bash
   pnpm run deploy-commands
   ```

7. **Start the bot**
   ```bash
   # Development mode
   pnpm run dev
   
   # Production mode
   pnpm run build
   pnpm run start
   ```

### Running from Monorepo Root

You can also run the bot from the monorepo root:

```bash
# Start all apps (bot + web)
pnpm dev

# Or run just the bot
pnpm -F khaxyrewrite dev
```

## 🐳 Docker Details

### Dockerfile

The bot uses a multi-stage Dockerfile for optimized image size (~360MB):

| Stage | Purpose |
|-------|---------|
| `builder` | Install deps, generate Prisma, build TypeScript |
| `deps` | Create flat node_modules with npm |
| `runner` | Minimal production image |

### What's Included

- Compiled JavaScript code
- Production dependencies
- Prisma client
- Localization files
- Config template

### What's NOT Included (Security)

- Source TypeScript files
- Development dependencies
- `.env` files or secrets
- Discord tokens

## 📁 Project Structure

```
apps/bot/
├── src/
│   ├── index.ts              # Bot entry point
│   ├── api/                   # Internal API server
│   ├── config-functions/      # Configuration handlers
│   ├── constants/             # Constants and enums
│   ├── events/                # Discord event handlers
│   ├── i18n/                  # Internationalization setup
│   ├── lib/                   # Core libraries and utilities
│   ├── slash-commands/        # Slash command definitions
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── locales/                   # Translation files
│   ├── en-GB/                 # English translations
│   └── tr-TR/                 # Turkish translations
├── scripts/                   # Build and utility scripts
├── config.toml                # Bot configuration
├── Dockerfile                 # Container build file
└── package.json
```

## 📜 Available Scripts

| Command                      | Description                       |
|------------------------------|-----------------------------------|
| `pnpm dev`                   | Build and run in development mode |
| `pnpm build`                 | Build for production              |
| `pnpm start`                 | Start the production build        |
| `pnpm deploy-commands`       | Deploy slash commands to Discord  |
| `pnpm lint`                  | Run ESLint                        |
| `pnpm type-check`            | Run TypeScript type checking      |
| `pnpm validate-translations` | Validate translation files        |

## ⚙️ Configuration

### config.toml

The `config.toml` file contains bot-specific settings:

- **Emojis** - Custom emoji IDs with fallbacks for servers without the emojis
- **Activity** - Bot status messages that rotate automatically
- **Logging** - Configure webhook, file, and console logging

## 🌐 Localization

The bot supports multiple languages. Translation files are located in the `locales/` directory:

- `en-GB/` - English (default)
- `tr-TR/` - Turkish

Each language folder contains YAML files for different translation categories:
- `commands.yml` - Command responses
- `events.yml` - Event messages
- `permissions.yml` - Permission names
- And more...

## 📄 License

This project is licensed under the GNU GPLv3 License.
