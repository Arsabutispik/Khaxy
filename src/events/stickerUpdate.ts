import { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildStickerUpdate,
  once: false,
  async execute(oldSticker, newSticker) {
    if (!newSticker.guild || !oldSticker.guild) return;
    const guildConfig = await getGuildConfig(newSticker.guildId);
    if (!guildConfig) return;
    const t = newSticker.client.i18next.getFixedT(guildConfig.language, "events", "stickerDelete");
    if (!guildConfig.sticker_logs_channel_id) return;
    const logChannel = newSticker.guild.channels.cache.get(toStringId(guildConfig.sticker_logs_channel_id));
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
        text: logEntry.executor?.username ?? t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
      });
    }
    const webhook = await returnWebhook(newSticker.client, logChannel, newSticker.guild.id, {
      id: guildConfig.role_logs_channel_id,
      type: WebhookType.ROLE_LOGS,
    });
    if (oldSticker.name !== newSticker.name) {
      embed.setTitle(t("name_change.embed.title")).setDescription(
        t("name_change.embed.description", {
          sticker: newSticker,
          old_name: oldSticker.name,
          new_name: newSticker.name,
        }),
      );
      embeds.push(embed);
    }
    if (oldSticker.description !== newSticker.description) {
      embed.setTitle(t("description_change.embed.title")).setDescription(
        t("description_change.embed.description", {
          sticker: newSticker,
          old_description: oldSticker.description,
          new_description: newSticker.description,
        }),
      );
      embeds.push(embed);
    }
    if (oldSticker.tags !== newSticker.tags) {
      embed.setTitle(t("tags_change.embed.title")).setDescription(
        t("tags_change.embed.description", {
          sticker: newSticker,
          old_tags: oldSticker.tags,
          new_tags: newSticker.tags,
        }),
      );
      embeds.push(embed);
    }
    webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send stickerUpdate embed(s) in ${newSticker.guild?.name} (${newSticker.guild?.id})`,
        logChannel: logChannel?.id,
      });
    });
  },
} satisfies EventBase<Events.GuildStickerUpdate>;
