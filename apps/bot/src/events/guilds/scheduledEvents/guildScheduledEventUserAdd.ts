import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logScheduledEventUserAdd } from "@utils";

export default {
  name: Events.GuildScheduledEventUserAdd,
  once: false,
  async execute(event, user) {
    if (user.partial) user = await user.fetch();
    if (event.partial) event = await event.fetch();
    if (!event.guild) return;

    const guildConfig = await getOrCreateGuild(event.guild.id);
    if (!guildConfig) return;

    await logScheduledEventUserAdd(event, user, guildConfig);
  },
} satisfies EventBase<Events.GuildScheduledEventUserAdd>;
