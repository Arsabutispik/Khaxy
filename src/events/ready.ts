import { Events } from "discord.js";
import type { EventBase } from "@customTypes";
import { logger } from "@lib";
import { loadEmojis, recoverMissedCronjob, replacePlaceholders, updateReloadableMessages } from "@utils";
export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    if (process.env.NODE_ENV === "development") {
      await client.application.commands
        .fetch({ guildId: process.env.GUILD_ID, withLocalizations: true })
        .catch(() => null);
    } else {
      await client.application.commands.fetch({ withLocalizations: true });
    }
    await recoverMissedCronjob(client);
    const emojis: Array<{ name: string; id: string; fallback: string }> = [
      {
        name: "searchEmoji",
        ...client.config.emojis.searchEmoji,
      },
      {
        name: "gearSpinning",
        ...client.config.emojis.gearSpinning,
      },
      {
        name: "mailSent",
        ...client.config.emojis.mailSent,
      },
      {
        name: "confirm",
        ...client.config.emojis.confirm,
      },
      {
        name: "reject",
        ...client.config.emojis.reject,
      },
      {
        name: "ban",
        ...client.config.emojis.ban,
      },
      {
        name: "edit",
        ...client.config.emojis.edit,
      },
    ];
    await loadEmojis(client, emojis);
    const messages = client.config.activity.messages;
    if (messages.length === 0) {
      logger.log({
        level: "warn",
        message: "No activity messages configured in config.toml",
        discord: false,
      });
    } else {
      const values = {
        guildCount: client.guilds.cache.size.toString(),
        // add more dynamic values here if needed
      };
      const status = messages[Math.floor(Math.random() * messages.length)];

      client.user!.setActivity(replacePlaceholders(status.message, values), { type: status.type });
      setInterval(() => {
        // Update only reloadable messages
        const values = {
          guildCount: client.guilds.cache.size.toString(),
          // add more dynamic values here if needed
        };
        const updatedMessages = updateReloadableMessages(messages, values);

        // Pick a random message from an updated list
        const status = updatedMessages[Math.floor(Math.random() * updatedMessages.length)];

        client.user!.setActivity(status.message, { type: status.type });
      }, 60000);
    }
    logger.log({
      level: "info",
      message: `Logged in as ${client.user!.tag}`,
      discord: false,
    });
  },
} satisfies EventBase<Events.ClientReady>;
