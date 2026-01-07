import { EventBase } from "@types";
import { Events } from "discord.js";
import { logRoleCreate } from "@utils";
import { getOrCreateGuild } from "@repo/database";

export default {
  name: Events.GuildRoleCreate,
  once: false,
  async execute(role) {
    const guildConfig = await getOrCreateGuild(role.guild.id);
    if (!guildConfig) return;
    await logRoleCreate(role, guildConfig);
  },
} satisfies EventBase<Events.GuildRoleCreate>;
