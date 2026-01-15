import { AnyThreadChannel, EmbedBuilder, ChannelType, time, TimestampStyles, AuditLogEvent } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logThreadDelete(thread: AnyThreadChannel, guildConfig: GuildWithLogs) {
  const t = thread.client.i18next.getFixedT(guildConfig.language, "events", "threadDelete");
  if (!guildConfig.logConfig?.threadLogsChannelId) return;
  const logChannel = thread.guild.channels.cache.get(guildConfig.logConfig.threadLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(t(($) => $.embed.title))
    .setDescription(
      t(($) => $.embed.description, {
        thread,
        parent: thread.parent,
        auto_archive_duration: t(`thread_auto_archive_duration.${thread.autoArchiveDuration}`),
        timestamp: time(thread.createdAt || new Date(), TimestampStyles.RelativeTime),
      }),
    )
    .setTimestamp();
  const auditLogs = await thread.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ThreadDelete,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  if (logEntry?.target?.id === thread.id) {
    embed.setFooter({
      text: logEntry.executor?.username ?? t(($) => $.unknown_executor),
      iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
    });
  }
  const webhook = await returnWebhook(thread.client, logChannel, thread.guild.id, guildConfig, {
    id: guildConfig.logConfig.threadLogsWebhookId,
    type: WebhookType.THREAD_LOGS,
  });
  if(webhook) {
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send threadDelete embed in ${thread.guild.name} (${thread.guild.id})`,
        channelId: logChannel.id,
      });
    });
  }
}