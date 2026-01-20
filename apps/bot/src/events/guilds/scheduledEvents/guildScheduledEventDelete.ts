import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logScheduledEventDelete } from "@utils";

export default {
  name: Events.GuildScheduledEventDelete,
  once: false,
  async execute(event) {
    if (!event.guild) return;

    const guildConfig = await getOrCreateGuild(event.guild.id);
    if (!guildConfig) return;
    await logScheduledEventDelete({ event, executor: event.creator, guildConfig });
  },
} satisfies EventBase<Events.GuildScheduledEventDelete>;
