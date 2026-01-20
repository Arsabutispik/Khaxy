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

export async function logChannelCreate(channel: NonThreadGuildBasedChannel, guildConfig: GuildWithLogs) {
  if (!guildConfig.logConfig?.channelLogsChannelId) return;
  const t = channel.client.i18next.getFixedT(guildConfig.language, "loggers", "channelEvents");
  const logChannel = channel.guild.channels.cache.get(guildConfig.logConfig?.channelLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  await sleep(2000); // Wait for 2 seconds to ensure audit logs are updated

  const auditLogs = await channel.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelCreate,
    })
    .catch(() => null);

  const logEntry = auditLogs?.entries.first();
  const executor = logEntry && logEntry.target?.id === channel.id ? logEntry.executor : null;

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle(t(($) => $.channelCreate.embed.title))
    .setDescription(
      t(($) => $.channelCreate.embed.description, {
        channel: channel,
        channel_type: t(($) => $.channelTypes[channel.type]),
        timestamp: time(channel.createdAt, TimestampStyles.LongDateShortTime),
      }),
    )
    .setThumbnail(channel.guild.iconURL() ?? null)
    .setTimestamp()
    .setFooter({
      text: executor?.tag ?? t(($) => $.unknownExecutor),
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
        message: `Failed to send channelCreate embed in ${channel.guild.name} (${channel.guild.id})`,
        channel: logChannel.id,
      });
    });
}
