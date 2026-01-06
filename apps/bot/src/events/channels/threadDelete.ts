import { EventBase } from "@types";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.ThreadDelete,
  once: false,
  async execute(thread) {
    const guildConfig = await getGuildConfig(thread.guild.id);
    if (!guildConfig) return;
    const t = thread.client.i18next.getFixedT(guildConfig.language, "events", "threadDelete");
    if (!guildConfig.thread_logs_channel_id) return;
    const logChannel = thread.guild.channels.cache.get(toStringId(guildConfig.thread_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
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
        text: logEntry.executor?.username ?? t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
      });
    }
    const webhook = await returnWebhook(thread.client, logChannel, thread.guild.id, {
      id: guildConfig.thread_logs_webhook_id,
      type: WebhookType.THREAD_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send threadDelete embed in ${thread.guild.name} (${thread.guild.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.ThreadDelete>;
