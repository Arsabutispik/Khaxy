import { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildEmojiDelete,
  once: false,
  async execute(emoji) {
    const guildConfig = await getGuildConfig(emoji.guild.id);
    if (!guildConfig) return;
    if (!guildConfig.emoji_logs_channel_id) return;
    const logChannel = emoji.guild.channels.cache.get(toStringId(guildConfig.emoji_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const auditLogs = await emoji.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.EmojiDelete,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    const t = emoji.client.i18next.getFixedT(guildConfig.language, "events", "emojiDelete");
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
          emoji: emoji,
          emoji_animated: emoji.animated
            ? emoji.client.allEmojis.get(emoji.client.config.emojis.confirm.id)?.format
            : emoji.client.allEmojis.get(emoji.client.config.emojis.reject.id)?.format,
          timestamp: time(new Date(), TimestampStyles.RelativeTime),
        }),
      )
      .setThumbnail(emoji.animated ? emoji.imageURL({ extension: "gif" }) : emoji.imageURL())
      .setTimestamp();
    if (logEntry?.target.id === emoji.id) {
      embed.setFooter({
        text: logEntry.executor?.username ?? t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
      });
    }
    const webhook = await returnWebhook(emoji.client, logChannel, emoji.guild.id, {
      id: guildConfig.emoji_logs_webhook_id,
      type: WebhookType.EMOJI_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send emojiDelete embed in ${emoji.guild.name} (${emoji.guild.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildEmojiDelete>;
