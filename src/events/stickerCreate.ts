import { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildStickerCreate,
  once: false,
  async execute(sticker) {
    if (!sticker.guild) return;
    const guildConfig = await getGuildConfig(sticker.guildId);
    if (!guildConfig) return;
    const t = sticker.client.i18next.getFixedT(guildConfig.language, "events", "stickerCreate");
    if (!guildConfig.sticker_logs_channel_id) return;
    const logChannel = sticker.guild.channels.cache.get(toStringId(guildConfig.sticker_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const auditLogs = await sticker.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.StickerCreate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
          sticker,
        }),
      )
      .setThumbnail(`https://media.discordapp.net/stickers/${sticker.id}.webp?size=240&amp;quality=lossless`)
      .setTimestamp();
    if (logEntry?.target?.id === sticker.id) {
      embed.setFooter({
        text: logEntry.executor?.tag ?? t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
      });
    }
    const webhook = await returnWebhook(sticker.client, logChannel, sticker.guild.id, {
      id: guildConfig.sticker_logs_webhook_id,
      type: WebhookType.STICKER_LOGS,
    });
    await webhook
      .send({
        embeds: [embed],
      })
      .catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send stickerCreate embed in ${sticker.guild!.name} (${sticker.guild!.id})`,
          channel: logChannel.id,
        });
      });
  },
} satisfies EventBase<Events.GuildStickerCreate>;
