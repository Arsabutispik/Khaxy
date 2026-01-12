import { AuditLogEvent, ChannelType, EmbedBuilder, GuildEmoji } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { logger } from "@lib";
import { returnWebhook, sleep, WebhookType } from "@utils";

export async function logsEmojiUpdate(oldEmoji: GuildEmoji, newEmoji: GuildEmoji, guildConfig: GuildWithLogs) {
  if (!guildConfig.logConfig?.guildLogsChannelId) return;
  const logChannel = newEmoji.guild.channels.cache.get(guildConfig.logConfig.guildLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  await sleep(2000); // Wait for 2 seconds to ensure audit logs are updated

  const auditLogs = await newEmoji.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.EmojiUpdate,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  const executor = logEntry && logEntry.target?.id === newEmoji.id ? logEntry.executor : null;
  const t = newEmoji.client.i18next.getFixedT(guildConfig.language, "events", "emojiUpdate");
  const embed = new EmbedBuilder()
    .setColor("Yellow")
    .setThumbnail(newEmoji.animated ? newEmoji.imageURL({ extension: "gif" }) : newEmoji.imageURL())
    .setTimestamp()
    .setFooter({
      text: executor?.tag ?? t("unknown_executor"),
      iconURL: executor?.displayAvatarURL() ?? undefined,
    });
  const webhook = await returnWebhook(newEmoji.client, logChannel, newEmoji.guild.id, guildConfig, {
    id: guildConfig.logConfig.guildLogsWebhookId,
    type: WebhookType.EMOJI_LOGS,
  });
  if (oldEmoji.name !== newEmoji.name) {
    embed.setTitle(t("name_change.embed.title")).setDescription(
      t("name_change.embed.description", {
        emoji: newEmoji,
        old_name: oldEmoji.name,
        new_name: newEmoji.name,
      }),
    );
    if (!webhook) return;
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send emojiCreate embed in ${newEmoji.guild.name} (${newEmoji.guild.id})`,
        channelId: logChannel.id,
      });
    });
  }
}