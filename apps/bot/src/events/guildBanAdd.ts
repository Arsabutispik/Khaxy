import type { EventBase } from "src/types/index.js";
import { AuditLogEvent, Events } from "discord.js";
import { modLog, sleep } from "src/utils/index.js";
import { getOrCreateGuild, InfractionType, createInfraction } from "@repo/database";
import { logBanAdd } from "src/utils/logBan.js";

export default {
  name: Events.GuildBanAdd,
  async execute(ban) {
    const guildConfig = await getOrCreateGuild(ban.guild.id);
    if (!guildConfig) return;

    await sleep(2000); // Wait for 2 seconds to ensure audit logs are updated

    const auditLogs = await ban.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    if (logEntry?.executor?.id === ban.client.user.id) return;

    const t = ban.client.i18next.getFixedT(guildConfig.language, "events", "guildBanAdd");
    await modLog(
      {
        guild: ban.guild,
        action: "BAN",
        user: ban.user,
        reason: ban.reason || logEntry?.reason || t("no_reason"),
        moderator: logEntry?.executor ?? null,
      },
      ban.client,
    );
    await createInfraction(
      ban.guild.id,
      ban.user.id,
      logEntry?.executor?.id || ban.client.user.id,
      InfractionType.BAN,
      ban.reason || logEntry?.reason || t("no_reason"),
    );
    await logBanAdd({
      guild: ban.guild,
      user: ban.user,
      reason: ban.reason || logEntry?.reason || t("no_reason"),
      executor: logEntry?.executor ?? null,
      guildConfig,
      t,
    });
  },
} satisfies EventBase<Events.GuildBanAdd>;
