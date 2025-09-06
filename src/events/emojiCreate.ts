import { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildEmojiCreate,
  once: false,
  async execute(emoji) {
    const guildConfig = await getGuildConfig(emoji.guild.id);
    if (!guildConfig) return;
    const t = emoji.client.i18next.getFixedT(guildConfig.language, "events", "emojiCreate");
    if (!guildConfig.emoji_logs_channel_id) return;
    const logChannel = emoji.guild.channels.cache.get(toStringId(guildConfig.emoji_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const auditLogs = await emoji.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.EmojiCreate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
          emoji: emoji,
          emoji_animated: emoji.animated
            ? emoji.client.allEmojis.get(emoji.client.config.emojis.confirm.id)?.format
            : emoji.client.allEmojis.get(emoji.client.config.emojis.reject.id)?.format,
          timestamp: emoji.createdAt.toLocaleString(),
        }),
      )
      .setThumbnail(emoji.imageURL())
      .setTimestamp();
    if (logEntry?.target?.id === emoji.id) {
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
        message: `Failed to send emojiCreate embed in ${emoji.guild.name} (${emoji.guild.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildEmojiCreate>;
