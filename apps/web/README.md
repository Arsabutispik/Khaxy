# Khaxy Web Dashboard

The web dashboard component of the Khaxy monorepo. A modern dashboard built with Next.js 16 for configuring and managing the Khaxy Discord bot.

## ✨ Features

- **Server Management** - Configure bot settings for your Discord servers
- **Modern UI** - Built with React 19, Tailwind CSS, and Radix UI components
- **Authentication** - Secure Discord OAuth login with Better Auth
- **Internationalization** - Support for English and Turkish
- **Dark/Light Mode** - Theme switching support
- **Responsive Design** - Works on desktop and mobile devices

## 🚀 Self-Hosting

### Prerequisites

- [Node.js](https://nodejs.org/) v22.0.0 or higher
- [pnpm](https://pnpm.io/) package manager
- [PostgreSQL](https://www.postgresql.org/) database (shared with the bot)
- The Khaxy bot must be running (the dashboard connects to its API)

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
   
   Ensure the `.env` file in `packages/database/` has your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/khaxy"
   ```

4. **Set up environment variables**
   
   Create a `.env.local` file in `apps/web/` with:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/khaxy"
   
   # Better Auth
   BETTER_AUTH_SECRET=your_random_secret_key
   BETTER_AUTH_URL=http://localhost:3000
   
   # Discord OAuth
   DISCORD_CLIENT_ID=your_discord_application_client_id
   DISCORD_CLIENT_SECRET=your_discord_application_client_secret
   
   # Bot API (internal communication)
   BOT_API_URL=http://localhost:3001
   ```

5. **Start the dashboard**
   ```bash
   # Development mode
   pnpm run dev
   
   # Production mode
   pnpm run build
   pnpm run start
   ```

### Running from Monorepo Root

You can run the dashboard from the monorepo root:

```bash
# Start all apps (bot + web)
pnpm dev

# Or run just the web dashboard
pnpm -F khaxy-dashboard dev
```

> **Note**: The web dashboard waits for the bot API to be available on port 3001 before starting.

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   │   └── ui/                # Reusable UI components
│   ├── actions/               # Server actions
│   ├── hooks/                 # Custom React hooks
│   ├── i18n/                  # Internationalization setup
│   ├── lib/                   # Utility libraries
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── messages/                  # Translation files
│   ├── en.json                # English translations
│   └── tr.json                # Turkish translations
├── public/                    # Static assets
└── package.json
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start in development mode with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript type checking |

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth sessions | ✅ |
| `BETTER_AUTH_URL` | Base URL of your dashboard | ✅ |
| `DISCORD_CLIENT_ID` | Discord application client ID | ✅ |
| `DISCORD_CLIENT_SECRET` | Discord application client secret | ✅ |
| `BOT_API_URL` | URL of the bot's internal API | ✅ |

### Discord OAuth Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (or create one)
3. Navigate to **OAuth2** settings
4. Add your redirect URL: `http://localhost:3000/api/auth/callback/discord`
5. Copy the **Client ID** and **Client Secret** to your `.env.local`

## 🌐 Localization

The dashboard supports multiple languages using `next-intl`. Translation files are in the `messages/` directory:

- `en.json` - English
- `tr.json` - Turkish

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **React**: React 19
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives
- **Authentication**: Better Auth with Discord OAuth
- **Animations**: Framer Motion
- **Database**: Prisma ORM (shared with bot)

## 📄 License

This project is licensed under the GNU GPLv3 License.
