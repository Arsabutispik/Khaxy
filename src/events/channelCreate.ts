import { EventBase } from "src/types/index.js";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";
export default {
  name: Events.ChannelCreate,
  once: false,
  async execute(channel) {
    const guildConfig = await getGuildConfig(channel.guildId);
    if (!guildConfig) return;
    const t = channel.client.i18next.getFixedT(guildConfig.language, "events", "channelCreate");
    if (!guildConfig.channel_logs_channel_id) return;
    const logChannel = channel.guild.channels.cache.get(toStringId(guildConfig.channel_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const auditLogs = await channel.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelCreate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
          channel: channel,
          channel_type: t(`channel_types.${channel.type}`),
          timestamp: time(channel.createdAt, TimestampStyles.ShortDateTime),
        }),
      )
      .setThumbnail(channel.guild.iconURL() ?? null)
      .setTimestamp();
    if (logEntry?.target?.id === channel.id) {
      embed.setFooter({
        text: logEntry.executor?.tag ?? t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
      });
    }
    const webhook = await returnWebhook(channel.client, logChannel, channel.guildId, {
      id: guildConfig.channel_logs_webhook_id,
      type: WebhookType.CHANNEL_LOGS,
    });
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
  },
} satisfies EventBase<Events.ChannelCreate>;
