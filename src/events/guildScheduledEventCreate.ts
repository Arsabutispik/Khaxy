import { EventBase } from "@customTypes";
import {
  AuditLogEvent,
  ChannelType,
  EmbedBuilder,
  Events,
  GuildScheduledEventEntityType,
  time,
  TimestampStyles,
} from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildScheduledEventCreate,
  once: false,
  async execute(event) {
    if (!event.guild) return;

    const guildConfig = await getGuildConfig(event.guild.id);
    if (!guildConfig) return;
    const t = event.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventCreate");
    if (!guildConfig.event_logs_channel_id) return;
    const logChannel = event.guild.channels.cache.get(toStringId(guildConfig.event_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder().setTimestamp().setThumbnail(event.coverImageURL() ?? event.guild.iconURL());
    const auditLogs = await event.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.GuildScheduledEventCreate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    if (logEntry?.target.id === event.id) {
      embed.setFooter({
        text: logEntry?.executor?.username || t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL(),
      });
    }
    if (event.entityType === GuildScheduledEventEntityType.External) {
      embed
        .setColor("Green")
        .setTitle(t("external_channel.embed.title"))
        .setDescription(
          t("external_channel.embed.description", {
            event: event,
            scheduled_start_time: event.scheduledStartAt
              ? time(event.scheduledStartAt, TimestampStyles.LongDateTime)
              : "N/A",
            scheduled_end_time: event.scheduledEndAt ? time(event.scheduledEndAt, TimestampStyles.LongDateTime) : "N/A",
          }),
        );
    } else {
      embed
        .setColor("Green")
        .setTitle(t("voice_channel.embed.title"))
        .setDescription(
          t("voice_channel.embed.description", {
            event: event,
            scheduled_start_time: event.scheduledStartAt
              ? time(event.scheduledStartAt, TimestampStyles.LongDateTime)
              : "N/A",
          }),
        );
    }
    const webhook = await returnWebhook(event.client, logChannel, event.guild.id, {
      id: guildConfig.event_logs_webhook_id,
      type: WebhookType.EVENT_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildScheduledEventCreate embed in ${event.guild?.name} (${event.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildScheduledEventCreate>;
