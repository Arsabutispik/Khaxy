import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logMessageDelete, logPollDelete } from "@utils";

export default {
  name: Events.MessageDelete,
  async execute(message) {
    if (!message.inGuild()) return;
    if (message.partial) return; // Ignore partial messages
    if (message.author.id === message.client.user.id) return; // Ignore messages sent by the bot itself
    if (message.author.bot) return; // Ignore bot messages
    const guildConfig = await getOrCreateGuild(message.guild.id);
    if (!guildConfig) return;
    if (message.content || message.attachments.size > 0) {
      await logMessageDelete(message, guildConfig);
    }
    if (message.poll) {
      await logPollDelete(message, guildConfig);
    }
  },
} satisfies EventBase<Events.MessageDelete>;
