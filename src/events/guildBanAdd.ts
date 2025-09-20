import type { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { addInfraction, formatDuration, modLog, returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";
import { getGuildConfig } from "@database";
import { InfractionType } from "@constants";

export default {
  name: Events.GuildBanAdd,
  async execute(ban) {
    // Get the guild data from the database
    const guildConfig = await getGuildConfig(ban.guild.id);

    // If no guild data is found, exit the function
    if (!guildConfig) return;

    const t = ban.client.i18next.getFixedT(guildConfig.language, "events", "guildBanAdd");
    const auditLogs = await ban.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    if (logEntry?.executor?.id === ban.client.user.id) return;
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
    await addInfraction({
      guild: ban.guild,
      member: ban.user.id,
      type: InfractionType.BAN,
      reason: ban.reason || logEntry?.reason || t("no_reason"),
      moderator: logEntry?.executor?.id || ban.client.user.id,
    });

    const logChannel = ban.guild.channels.cache.get(toStringId(guildConfig.guild_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const webhook = await returnWebhook(ban.client, logChannel, ban.guild.id, {
      id: guildConfig.guild_logs_webhook_id,
      type: WebhookType.GUILD_LOGS,
    });
    const member = await ban.guild.members.fetch(ban.user.id).catch(() => null);
    const embed = new EmbedBuilder()
      .setTitle(t("embed.title"))
      .setColor("Red")
      .setThumbnail(ban.user.displayAvatarURL())
      .setTimestamp()
      .setDescription(
        t("embed.description", {
          user: ban.user,
          timestamp:
            member && member.joinedTimestamp
              ? formatDuration(member.joinedTimestamp, guildConfig.language)
              : t("never_joined"),
        }),
      )
      .addFields([
        {
          name: t("embed.fields.reason"),
          value: ban.reason || logEntry?.reason || t("no_reason"),
        },
      ])
      .setFooter({
        text: logEntry?.executor?.tag || t("unknown_executor"),
        iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
      });
    await webhook
      .send({
        embeds: [embed],
        allowedMentions: { parse: [] }, // Prevent mentions in the log
      })
      .catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guildBanAdd embed in ${ban.guild.name} (${ban.guild.id})`,
          error: error,
          channelId: logChannel.id,
        });
      });
  },
} satisfies EventBase<Events.GuildBanAdd>;
