import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logScheduledEventUpdate } from "@utils";

export default {
  name: Events.GuildScheduledEventUpdate,
  once: false,
  async execute(oldEvent, newEvent) {
    if (!newEvent.guild) return;
    if (oldEvent?.partial) oldEvent = await oldEvent.fetch().catch(() => null);
    if (!oldEvent) return;
    const guildConfig = await getOrCreateGuild(newEvent.guild.id);
    if (!guildConfig) return;
    await logScheduledEventUpdate({ event: oldEvent, newEvent, executor: newEvent.creator, guildConfig });
  },
} satisfies EventBase<Events.GuildScheduledEventUpdate>;
