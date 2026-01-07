import { EventBase } from "@types";
import { Events, Role } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logRoleUpdate } from "@utils";

export default {
  name: Events.GuildRoleUpdate,
  once: false,
  async execute(oldRole: Role, newRole: Role) {
    // 1. Fetch Config
    const guildConfig = await getOrCreateGuild(newRole.guild.id);
    if (!guildConfig) return;

    // 2. Delegate to Logger
    await logRoleUpdate(oldRole, newRole, guildConfig);
  },
} satisfies EventBase<Events.GuildRoleUpdate>;
