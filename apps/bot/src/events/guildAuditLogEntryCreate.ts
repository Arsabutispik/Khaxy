import { EventBase } from "src/types/index.js";
import {
  Events,
} from "discord.js";
import { getOrCreateGuild} from "@repo/database";
import { logAuditLogEntryCreate } from "@utils";

export default {
  name: Events.GuildAuditLogEntryCreate,
  once: false,
  async execute(entry, guild) {
    const guildConfig = await getOrCreateGuild(guild.id);
    if (!guildConfig) return;
    await logAuditLogEntryCreate(entry, guild, guildConfig);
  },
} satisfies EventBase<Events.GuildAuditLogEntryCreate>;