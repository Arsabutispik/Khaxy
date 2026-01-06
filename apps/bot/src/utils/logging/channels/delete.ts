import {
  AuditLogEvent,
  ChannelType,
  EmbedBuilder,
  NonThreadGuildBasedChannel,
  time,
  TimestampStyles,
} from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, sleep, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logsChannelDelete(channel: NonThreadGuildBasedChannel, guildConfig: GuildWithLogs) {
  if (!guildConfig.logConfig?.channelLogsChannelId) return;
  const t = channel.client.i18next.getFixedT(guildConfig.language, "events", "channelDelete");
  const logChannel = channel.guild.channels.cache.get(guildConfig.logConfig.channelLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  await sleep(2000); // Wait for 2 seconds to ensure audit logs are updated

  const auditLogs = await channel.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  const executor = logEntry && logEntry.target?.id === channel.id ? logEntry.executor : null;

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(t("embed.title"))
    .setDescription(
      t("embed.description", {
        channel: channel,
        channel_type: t(`channel_types.${channel.type}`),
        timestamp: time(channel.createdAt, TimestampStyles.LongDateShortTime),
      }),
    )
    .setThumbnail(channel.guild.iconURL() ?? null)
    .setTimestamp()
    .setFooter({
      text: executor?.tag ?? t("unknown_executor"),
      iconURL: executor?.displayAvatarURL() ?? undefined,
    });

  const webhook = await returnWebhook(channel.client, logChannel, channel.guildId, guildConfig, {
    id: guildConfig.logConfig.channelLogsWebhookId,
    type: WebhookType.CHANNEL_LOGS,
  });
  if (!webhook) return;
  await webhook
    .send({
      embeds: [embed],
    })
    .catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send channelDelete embed in ${channel.guild.name} (${channel.guild.id})`,
        channelId: logChannel.id,
      });
    });
}
