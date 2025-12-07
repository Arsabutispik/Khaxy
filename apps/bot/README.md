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

### Prerequisites

- [Node.js](https://nodejs.org/) v22.0.0 or higher
- [pnpm](https://pnpm.io/) package manager
- [PostgreSQL](https://www.postgresql.org/) database
- A [Discord Application](https://discord.com/developers/applications) with a bot token

### Setup

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone https://github.com/Arsabutispik/Khaxy.git
   cd Khaxy
   ```

2. **Install dependencies** from the root of the monorepo
   ```bash
   pnpm install
   ```

3. **Configure the database**
   
   Create a `.env` file in `packages/database/` with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/khaxy"
   ```

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

6. **Set up environment variables**
   
   Create a `.env` file in `apps/bot/` with:
   ```env
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_application_client_id
   ```

7. **Deploy slash commands**
   ```bash
   pnpm run deploy-commands
   ```

8. **Start the bot**
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

## 📁 Project Structure

```
apps/bot/
├── src/
│   ├── index.ts              # Bot entry point
│   ├── api/                   # Internal API server
│   ├── config-functions/      # Configuration handlers
│   ├── constants/             # Constants and enums
│   ├── database/              # Database queries
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

### Environment Variables

| Variable    | Description                              | Required |
|-------------|------------------------------------------|----------|
| `TOKEN`     | Discord bot token                        | ✅        |
| `CLIENT_ID` | Discord application client ID            | ✅        |
| `DOCS_URL`  | URL for bot documentation                | ✅        |
| `GUILD_ID`  | (Optional) Guild ID for testing commands | ❌        |

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
