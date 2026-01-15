import { AuditLogEvent, ChannelType, EmbedBuilder, GuildEmoji, time, TimestampStyles } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, sleep, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logsEmojiDelete(emoji: GuildEmoji, guildConfig: GuildWithLogs) {
  if (!guildConfig.logConfig?.emojiLogsChannelId) return;
  const logChannel = emoji.guild.channels.cache.get(guildConfig.logConfig.emojiLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  await sleep(2000); // Wait for 2 seconds to ensure audit logs are updated

  const auditLogs = await emoji.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.EmojiDelete,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  const executor = logEntry && logEntry.target?.id === emoji.id ? logEntry.executor : null;
  const t = emoji.client.i18next.getFixedT(guildConfig.language, "events", "emojiDelete");
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(t(($) => $.embed.title))
    .setDescription(
      t(($) => $.embed.description, {
        emoji: emoji,
        emoji_animated: emoji.animated
          ? emoji.client.allEmojis.get(emoji.client.config.emojis.confirm.id)?.format
          : emoji.client.allEmojis.get(emoji.client.config.emojis.reject.id)?.format,
        timestamp: time(new Date(), TimestampStyles.RelativeTime),
      }),
    )
    .setThumbnail(emoji.animated ? emoji.imageURL({ extension: "gif" }) : emoji.imageURL())
    .setTimestamp()
    .setFooter({
      text: executor?.tag ?? t(($) => $.unknown_executor),
      iconURL: executor?.displayAvatarURL() ?? undefined,
    });
  const webhook = await returnWebhook(emoji.client, logChannel, emoji.guild.id, guildConfig, {
    id: guildConfig.logConfig.emojiLogsWebhookId,
    type: WebhookType.EMOJI_LOGS,
  });
  if (!webhook) return;
  await webhook.send({ embeds: [embed] }).catch((error) => {
    logger.log({
      level: "error",
      error,
      message: `Failed to send emojiDelete embed in ${emoji.guild.name} (${emoji.guild.id})`,
      channelId: logChannel.id,
    });
  });
}
