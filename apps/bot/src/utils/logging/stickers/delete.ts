import { Sticker, ChannelType, AuditLogEvent, EmbedBuilder } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logStickerDelete(sticker: Sticker, guildConfig: GuildWithLogs) {
  if(!sticker.guild) return;
  const t = sticker.client.i18next.getFixedT(guildConfig.language, "events", "stickerDelete");
  if (!guildConfig.logConfig?.stickerLogsChannelId) return;
  const logChannel = sticker.guild.channels.cache.get(guildConfig.logConfig.stickerLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const auditLogs = await sticker.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.StickerDelete,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  const embed = new EmbedBuilder()
    .setColor("Red")
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
  const webhook = await returnWebhook(sticker.client, logChannel, sticker.guild.id, guildConfig, {
    id: guildConfig.logConfig.stickerLogsWebhookId,
    type: WebhookType.STICKER_LOGS,
  });
  if(webhook) {
    await webhook
      .send({
        embeds: [embed],
      })
      .catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send stickerDelete embed in ${sticker.guild!.name} (${sticker.guild!.id})`,
          channel: logChannel.id,
        });
      });
  }
}