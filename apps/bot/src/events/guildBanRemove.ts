import type { EventBase } from "src/types/index.js";
import { AuditLogEvent, Events } from "discord.js";
import { modLog, logBanRemove } from "src/utils/index.js";
import { getOrCreateGuild } from "@repo/database";

export default {
  name: Events.GuildBanRemove,
  async execute(ban) {
    const guildConfig = await getOrCreateGuild(ban.guild.id);
    if (!guildConfig) return;

    const auditLogs = await ban.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanRemove,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    if (logEntry?.executor?.id === ban.client.user.id) return;

    const t = ban.client.i18next.getFixedT(guildConfig.language, "events", "guildBanRemove");
    await modLog(
      {
        guild: ban.guild,
        user: ban.user,
        moderator: logEntry?.executor ?? null,
        action: "UNBAN",
        reason: ban.reason || t("no_reason"),
      },
      ban.client,
    );
    await logBanRemove({
      guild: ban.guild,
      user: ban.user,
      reason: ban.reason || t("no_reason"),
      executor: logEntry?.executor ?? null,
      guildConfig,
      t,
    });
  },
} satisfies EventBase<Events.GuildBanRemove>;
