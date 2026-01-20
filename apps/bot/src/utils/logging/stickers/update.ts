import { Sticker, ChannelType, AuditLogEvent, EmbedBuilder } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logStickerUpdate(oldSticker: Sticker, newSticker: Sticker, guildConfig: GuildWithLogs) {
  if (!newSticker.guild || !oldSticker.guild) return;
  const t = newSticker.client.i18next.getFixedT(guildConfig.language, "loggers", "stickerEvents");
  if (!guildConfig.logConfig?.stickerLogsChannelId) return;
  const logChannel = newSticker.guild.channels.cache.get(guildConfig.logConfig.stickerLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const auditLogs = await newSticker.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.StickerUpdate,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  let embeds: Array<EmbedBuilder> = [];
  const embed = new EmbedBuilder()
    .setColor("Yellow")
    .setTimestamp()
    .setThumbnail(`https://media.discordapp.net/stickers/${newSticker.id}.webp?size=240&amp;quality=lossless`);
  if (logEntry?.target.id === newSticker.id) {
    embed.setFooter({
      text: logEntry.executor?.username ?? t(($) => $.unknownExecutor),
      iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
    });
  }
  const webhook = await returnWebhook(newSticker.client, logChannel, newSticker.guild.id, guildConfig, {
    id: guildConfig.logConfig.stickerLogsWebhookId,
    type: WebhookType.STICKER_LOGS,
  });
  if (oldSticker.name !== newSticker.name) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.stickerUpdate.nameChange.embed.title))
      .setDescription(
        t(($) => $.stickerUpdate.nameChange.embed.description, {
          sticker: newSticker,
          old_name: oldSticker.name,
          new_name: newSticker.name,
        }),
      );
    embeds.push(embedClone);
  }
  if (oldSticker.description !== newSticker.description) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.stickerUpdate.descriptionChange.embed.title))
      .setDescription(
        t(($) => $.stickerUpdate.descriptionChange.embed.description, {
          sticker: newSticker,
          old_description: oldSticker.description,
          new_description: newSticker.description,
        }),
      );
    embeds.push(embedClone);
  }
  if (oldSticker.tags !== newSticker.tags) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.stickerUpdate.tagsChange.embed.title))
      .setDescription(
        t(($) => $.stickerUpdate.tagsChange.embed.description, {
          sticker: newSticker,
          old_tags: oldSticker.tags,
          new_tags: newSticker.tags,
        }),
      );
    embeds.push(embedClone);
  }
  if (embeds.length > 0 && webhook) {
    webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send stickerUpdate embed(s) in ${newSticker.guild?.name} (${newSticker.guild?.id})`,
        logChannel: logChannel?.id,
      });
    });
  }
}
