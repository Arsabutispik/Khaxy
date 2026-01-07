import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logRoleDelete } from "@utils";

export default {
  name: Events.GuildRoleDelete,
  once: false,
  async execute(role) {
    const guildConfig = await getOrCreateGuild(role.guild.id);
    if (!guildConfig) return;
    await logRoleDelete(role, guildConfig);
  },
} satisfies EventBase<Events.GuildRoleDelete>;
