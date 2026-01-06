import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "../../../../../../../../../../var/home/ispik/WebstormProjects/Khaxy/packages/database/src/index.js";
import { logScheduledEventDelete } from "@utils";

export default {
  name: Events.GuildScheduledEventDelete,
  once: false,
  async execute(event) {
    if (!event.guild) return;

    const guildConfig = await getOrCreateGuild(event.guild.id);
    if (!guildConfig) return;
    const t = event.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventDelete");
    await logScheduledEventDelete({ event, executor: event.creator, guildConfig, t });
  },
} satisfies EventBase<Events.GuildScheduledEventDelete>;
