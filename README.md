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

# Set up environment variables (see individual app READMEs)

# Run database migrations
pnpm db:migrate

# Start all applications in development mode
pnpm dev
```

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
