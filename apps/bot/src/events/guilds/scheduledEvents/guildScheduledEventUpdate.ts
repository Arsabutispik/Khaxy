import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "../../../../../../../../../../var/home/ispik/WebstormProjects/Khaxy/packages/database/src/index.js";
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
    const t = newEvent.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventUpdate");
    await logScheduledEventUpdate({ event: oldEvent, newEvent, executor: newEvent.creator, guildConfig, t });
  },
} satisfies EventBase<Events.GuildScheduledEventUpdate>;
