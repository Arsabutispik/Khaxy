import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "../../../../../../../../../../var/home/ispik/WebstormProjects/Khaxy/packages/database/src/index.js";
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

    const t = event.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventUserAdd");
    await logScheduledEventUserAdd(event, user, guildConfig, t);
  },
} satisfies EventBase<Events.GuildScheduledEventUserAdd>;