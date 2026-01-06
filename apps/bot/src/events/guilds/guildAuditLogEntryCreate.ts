import { EventBase } from "@types";
import {
  Events,
} from "discord.js";
import { getOrCreateGuild} from "../../../../../../../../../var/home/ispik/WebstormProjects/Khaxy/packages/database/src/index.js";
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