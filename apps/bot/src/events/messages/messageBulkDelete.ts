import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logMessageBulkDelete } from "@utils";

export default {
  name: Events.MessageBulkDelete,
  async execute(messages) {
    if (messages.size === 0) return;
    const guild = messages.first()?.guild;
    if (!guild) return;

    const guildConfig = await getOrCreateGuild(guild.id);
    if (!guildConfig) return;
    await logMessageBulkDelete(messages, guild, guildConfig);
  },
} satisfies EventBase<Events.MessageBulkDelete>;
