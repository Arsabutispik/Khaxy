import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import i18next, { initI18n } from "./i18n/index.js";
import { logger } from "src/lib/index.js";
import { CronJob } from "cron";
import {
  CheckExpiredModmailBlacklists,
  checkExpiredThreads,
  checkPunishments,
  colorUpdate,
  RegisterSlashCommands,
} from "src/utils/index.js";
import { loadEvents } from "./utils/system/eventHandler.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessagePolls,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.SoundboardSound,
  ],
});
await initI18n();
client.i18next = i18next;
client.slashCommands = new Collection();
client.allEmojis = new Collection();
client.webhooks = new Collection();
client.config = (await import("src/lib/index.js")).Config;

await RegisterSlashCommands(client);
await loadEvents(client);

await client.login(process.env.TOKEN).catch((error) => {
  logger.log({
    level: "error",
    error,
    message: "Failed to login to Discord",
  });
});

CronJob.from({
  cronTime: "* * * * *",
  onTick: () => checkPunishments(client),
  start: true,
  timeZone: "UTC",
});
CronJob.from({
  cronTime: "* * * * *",
  onTick: async () => await checkExpiredThreads(client),
  start: true,
  timeZone: "UTC",
});
CronJob.from({
  cronTime: "* * * * *",
  onTick: async () => await CheckExpiredModmailBlacklists(client),
  start: true,
  timeZone: "UTC",
});
CronJob.from({
  cronTime: "0 0 * * *",
  onTick: () => colorUpdate(client),
  onComplete: () => {
    logger.log({
      level: "info",
      message: "Color of the day cronjob has been completed.",
      discord: false,
    });
  },
  start: true,
  timeZone: "UTC",
});

process.on("uncaughtException", (err) => {
  logger.log({
    level: "error",
    error: err,
    message: "Uncaught Exception",
  });
});
