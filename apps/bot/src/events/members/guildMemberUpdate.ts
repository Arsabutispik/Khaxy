import type { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logMemberUpdate } from "@utils";

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember, newMember) {
    const guildConfig = await getOrCreateGuild(oldMember.guild.id);
    if (!guildConfig) return;

    await logMemberUpdate({ oldMember, newMember, guildConfig });
  },
} satisfies EventBase<Events.GuildMemberUpdate>;
