import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "../@repo/database";
import { logScheduledEventUserRemove } from "@utils";
export default {
  name: Events.GuildScheduledEventUserRemove,
  once: false,
  async execute(event, user) {
    if (user.partial) user = await user.fetch();
    if (event.partial) event = await event.fetch();
    if (!event.guild) return;
    const guildConfig = await getOrCreateGuild(event.guild.id);
    if (!guildConfig) return;
    const t = event.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventUserRemove");
    await logScheduledEventUserRemove(event, user, guildConfig, t);
  },
} satisfies EventBase<Events.GuildScheduledEventUserRemove>;