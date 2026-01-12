import { EventBase } from "@types";
import { AuditLogEvent, Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logScheduledEventCreate } from "@utils";

export default {
  name: Events.GuildScheduledEventCreate,
  once: false,
  async execute(event) {
    if (!event.guild) return;
    const guildConfig = await getOrCreateGuild(event.guild.id);
    if (!guildConfig) return;
    const t = event.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventCreate");
    const auditLogs = await event.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.GuildScheduledEventCreate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    const executor = logEntry && logEntry.target?.id === event.id ? logEntry.executor : null;
    await logScheduledEventCreate({ event, executor, guildConfig, t });
  },
} satisfies EventBase<Events.GuildScheduledEventCreate>;
