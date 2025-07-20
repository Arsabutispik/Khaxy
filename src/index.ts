import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import i18next, { initI18n } from "./i18n/index.js";
import { logger } from "@lib";
import { CronJob } from "cron";
import {
  checkPunishments,
  colorUpdate,
  checkExpiredThreads,
  RegisterSlashCommands,
  CheckExpiredModMailBlacklists,
} from "@utils";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});
await initI18n();
client.i18next = i18next;
client.slashCommands = new Collection();
client.allEmojis = new Collection();
client.webhooks = new Collection();
client.config = (await import("@lib")).Config;
await RegisterSlashCommands(client);
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = (await import(pathToFileURL(filePath).href)).default;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

CronJob.from({
  cronTime: "* * * * *",
  onTick: () => checkPunishments(client),
  start: true,
  timeZone: "UTC",
});

// Run every minute
CronJob.from({
  cronTime: "* * * * *",
  onTick: async () => await checkExpiredThreads(client),
  start: true,
  timeZone: "UTC",
});
CronJob.from({
  cronTime: "* * * * *",
  onTick: async () => await CheckExpiredModMailBlacklists(client),
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
