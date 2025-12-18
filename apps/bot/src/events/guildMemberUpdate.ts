import type { EventBase } from "src/types/index.js";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logMemberUpdate } from "src/utils/index.js";

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember, newMember) {
    const guildConfig = await getOrCreateGuild(oldMember.guild.id);
    if (!guildConfig) return;

    const t = newMember.client.i18next.getFixedT(guildConfig.language, "events", "guildMemberUpdate");
    await logMemberUpdate({ oldMember, newMember, guildConfig, t });
  },
} satisfies EventBase<Events.GuildMemberUpdate>;
