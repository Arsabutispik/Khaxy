import { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildEmojiUpdate,
  once: false,
  async execute(oldEmoji, newEmoji) {
    const guildConfig = await getGuildConfig(newEmoji.guild.id);
    if (!guildConfig) return;
    if (!guildConfig.emoji_logs_channel_id) return;
    const logChannel = newEmoji.guild.channels.cache.get(toStringId(guildConfig.emoji_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const auditLogs = await newEmoji.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.EmojiUpdate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    const t = newEmoji.client.i18next.getFixedT(guildConfig.language, "events", "emojiUpdate");
    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setThumbnail(newEmoji.animated ? newEmoji.imageURL({ extension: "gif" }) : newEmoji.imageURL())
      .setTimestamp();
    if (logEntry?.target.id === newEmoji.id) {
      embed.setFooter({
        text: logEntry.executor?.username ?? t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
      });
    }
    const webhook = await returnWebhook(newEmoji.client, logChannel, newEmoji.guild.id, {
      id: guildConfig.emoji_logs_webhook_id,
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
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send emojiCreate embed in ${newEmoji.guild.name} (${newEmoji.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }
  },
} satisfies EventBase<Events.GuildEmojiUpdate>;
