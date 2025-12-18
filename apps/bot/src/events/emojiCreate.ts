import { EventBase } from "src/types/index.js";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, GuildEmoji, time, TimestampStyles } from "discord.js";
import { getOrCreateGuild, GuildWithLogs } from "@repo/database";
import { returnWebhook, sleep, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.GuildEmojiCreate,
  once: false,
  async execute(emoji) {
    const guildConfig = await getOrCreateGuild(emoji.guild.id);
    if (!guildConfig) return;
    await logEmojiCreate(emoji, guildConfig);
  },
} satisfies EventBase<Events.GuildEmojiCreate>;

async function logEmojiCreate(emoji: GuildEmoji, guildConfig: GuildWithLogs) {
  const t = emoji.client.i18next.getFixedT(guildConfig.language, "events", "emojiCreate");
  if (!guildConfig.logConfig?.emojiLogsChannelId) return;
  const logChannel = emoji.guild.channels.cache.get(guildConfig.logConfig.emojiLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  await sleep(2000); // Wait for 2 seconds to ensure audit logs are updated

  const auditLogs = await emoji.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.EmojiCreate,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  const executor = logEntry && logEntry.target?.id === emoji.id ? logEntry.executor : null;
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle(t("embed.title"))
    .setDescription(
      t("embed.description", {
        emoji: emoji,
        emoji_animated: emoji.animated
          ? emoji.client.allEmojis.get(emoji.client.config.emojis.confirm.id)?.format
          : emoji.client.allEmojis.get(emoji.client.config.emojis.reject.id)?.format,
        timestamp: time(emoji.createdAt, TimestampStyles.RelativeTime),
      }),
    )
    .setThumbnail(emoji.animated ? emoji.imageURL({ extension: "gif" }) : emoji.imageURL())
    .setTimestamp()
    .setFooter({
      text: executor?.tag ?? t("unknown_executor"),
      iconURL: executor?.displayAvatarURL() ?? undefined,
    });
  const webhook = await returnWebhook(emoji.client, logChannel, emoji.guild.id, guildConfig, {
    id: logChannel.id,
    type: WebhookType.EMOJI_LOGS,
  });
  if (!webhook) return;
  await webhook.send({ embeds: [embed] }).catch((error) => {
    logger.log({
      level: "error",
      error,
      message: `Failed to send emojiCreate embed in ${emoji.guild.name} (${emoji.guild.id})`,
      channelId: logChannel.id,
    });
  });
}
