# Khaxy

Khaxy is a modern rewrite of the [Khaxy_Legacy](https://github.com/Arsabutispik/Khaxy_Legacy) Discord bot, introducing SQL database support, internationalization (i18n), and improved customization. Built with TypeScript and Discord.js v14, it's a moderation and utility bot designed for Discord servers, featuring slash commands, modmail, and more.

## 📦 Monorepo Structure

This project is organized as a monorepo using [pnpm workspaces](https://pnpm.io/workspaces) and [Turborepo](https://turbo.build/repo):

```
khaxy/
├── apps/
│   ├── bot/          # Discord bot application
│   └── web/          # Web dashboard (Next.js)
├── packages/
│   └── database/     # Shared Prisma database package
└── ...
```

| Package                                    | Description                                    |
|--------------------------------------------|------------------------------------------------|
| [`apps/bot`](./apps/bot)                   | The main Discord bot built with Discord.js v14 |
| [`apps/web`](./apps/web)                   | Web dashboard built with Next.js               |
| [`packages/database`](./packages/database) | Shared Prisma database client and schema       |

## ✨ Features

- **Moderation Tools** - Comprehensive moderation commands (ban, kick, mute, warn, etc.)
- **Modmail System** - Private communication channel between users and moderators
- **Internationalization** - Multi-language support (English & Turkish)
- **Slash Commands** - Modern Discord slash command interface
- **Web Dashboard** - Configure your bot through a web interface
- **Logging** - Detailed server logging with customizable options

## 🛠️ Tech Stack

- **Runtime**: Node.js 22+
- **Package Manager**: pnpm
- **Build System**: Turborepo
- **Bot**: Discord.js v14, TypeScript, i18next
- **Web**: Next.js 16, React 19, Tailwind CSS, Better Auth
- **Database**: PostgreSQL with Prisma ORM

## 🚀 Self-Hosting

To self-host Khaxy, please refer to the documentation for each application:

- **[Bot Self-Hosting Guide](./apps/bot/README.md)** - Instructions for setting up the Discord bot
- **[Web Dashboard Guide](./apps/web/README.md)** - Instructions for setting up the web dashboard

### Quick Start (Development)

```bash
# Clone the repository
git clone https://github.com/Arsabutispik/Khaxy.git
cd Khaxy

# Install dependencies
pnpm install

# Set up environment variables (see below)
cp .env.example .env
# Edit .env with your values

# Run database migrations
pnpm db:migrate

# Start all applications in development mode
pnpm dev
```

## ⚙️ Environment Variables

All environment variables are defined in a single `.env` file at the **root** of the monorepo. This keeps configuration centralized and less confusing.

Create a `.env` file in the root directory with the following variables:

```env
# --- Discord Bot ---
TOKEN=your_discord_bot_token
GUILD_ID=your_test_guild_id
CLIENT_ID=your_discord_application_client_id
DOCS_URL=https://docs.khaxy.net

# --- Web App ---
BETTER_AUTH_SECRET=generate_with_openssl_rand_base64_32
BETTER_AUTH_URL=http://localhost:3000
DISCORD_CLIENT_ID=your_discord_application_client_id
POSTGRES_URL=your_postgres_connection_string
DISCORD_CLIENT_SECRET=your_discord_oauth_client_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
FASTIFY_API_URL=http://localhost:3001
INTERNAL_API_KEY=generate_a_secure_random_key

# --- Database ---
DATABASE_URL=postgres://user:password@localhost:5432/khaxy

# --- Other ---
NODE_ENV=development
API_KEY_PBKDF2_SALT=your_salt_value
```

### Environment Variables Reference

| Variable                | Description                                                                   | Used By  |
|-------------------------|-------------------------------------------------------------------------------|----------|
| `TOKEN`                 | Discord bot token                                                             | Bot      |
| `GUILD_ID`              | Guild ID for development/testing                                              | Bot      |
| `CLIENT_ID`             | Discord application client ID                                                 | Bot      |
| `DOCS_URL`              | URL for bot documentation                                                     | Bot      |
| `BETTER_AUTH_SECRET`    | Secret key for Better Auth sessions (generate with `openssl rand -base64 32`) | Web      |
| `BETTER_AUTH_URL`       | Base URL of your web dashboard                                                | Web      |
| `DISCORD_CLIENT_ID`     | Discord application client ID                                                 | Web      |
| `POSTGRES_URL`          | PostgreSQL connection string for web app                                      | Web      |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 client secret                                                  | Web      |
| `DISCORD_BOT_TOKEN`     | Discord bot token (for API calls)                                             | Web      |
| `FASTIFY_API_URL`       | URL of the bot's internal API                                                 | Web      |
| `INTERNAL_API_KEY`      | Secret key for bot-web communication                                          | Bot, Web |
| `DATABASE_URL`          | PostgreSQL connection string                                                  | Database |
| `NODE_ENV`              | Environment mode (`development` or `production`)                              | All      |
| `API_KEY_PBKDF2_SALT`   | Salt for API key hashing                                                      | Bot      |

## 📜 Available Scripts

| Command            | Description                        |
|--------------------|------------------------------------|
| `pnpm dev`         | Start all apps in development mode |
| `pnpm build`       | Build all apps for production      |
| `pnpm lint`        | Run linting across all packages    |
| `pnpm db:generate` | Generate Prisma client             |
| `pnpm db:migrate`  | Run database migrations            |
| `pnpm format`      | Format code with Prettier          |
| `pnpm type-check`  | Run TypeScript type checking       |

## 🤝 Contributing

Contributions are welcome! Please open issues or pull requests for new features, bug fixes, or improvements.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a pull request

## 📄 License

This project is licensed under the GNU GPLv3 License - see the [LICENSE](./LICENSE) file for details.
