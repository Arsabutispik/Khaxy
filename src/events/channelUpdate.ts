import { EventBase } from "@customTypes";
import { Events, ChannelType, EmbedBuilder, AuditLogEvent } from "discord.js";
import { getGuildConfig } from "@database";
import { diffOverwrites, returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";
import { isDeepStrictEqual } from "node:util";

export default {
  name: Events.ChannelUpdate,
  once: false,
  async execute(oldChannel, newChannel) {
    if (oldChannel.isDMBased() || newChannel.isDMBased()) return; // Ensure the channel is part of a guild
    const guildConfig = await getGuildConfig(oldChannel.guildId);
    if (!guildConfig) return;
    const t = oldChannel.client.i18next.getFixedT(guildConfig.language, "events", "channelUpdate");
    const logChannel = oldChannel.guild.channels.cache.get(toStringId(guildConfig.channel_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const auditLogs = await oldChannel.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelUpdate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    if (logEntry?.executor?.id === newChannel.client.user.id) return;
    const webhook = await returnWebhook(newChannel.client, logChannel, newChannel.guild.id, {
      id: guildConfig.channel_logs_webhook_id,
      type: WebhookType.CHANNEL_LOGS,
    });
    const embed = new EmbedBuilder();
    if (logEntry?.target?.id === newChannel.id) {
      embed.setFooter({
        text: logEntry?.executor?.tag || t("unknown_executor"),
        iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
      });
    }
    if (oldChannel.name !== newChannel.name) {
      embed
        .setColor("Yellow")
        .setTitle(t("name_change.embed.title"))
        .setDescription(
          t("name_change.embed.description", {
            channel: newChannel,
            old_name: oldChannel.name,
            new_name: newChannel.name,
          }),
        )
        .setThumbnail(newChannel.guild.iconURL() ?? null)
        .setTimestamp();

      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send channelUpdate embed in ${newChannel.guild.name} (${newChannel.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }

    if (
      oldChannel.isTextBased() &&
      !oldChannel.isVoiceBased() &&
      newChannel.isTextBased() &&
      !newChannel.isVoiceBased() &&
      (oldChannel.topic || null) !== (newChannel.topic || null)
    ) {
      embed
        .setColor("Yellow")
        .setTitle(t("topic_change.embed.title"))
        .setDescription(
          t("topic_change.embed.description", {
            channel: newChannel,
            old_topic: oldChannel.topic || t("no_topic"),
            new_topic: newChannel.topic || t("no_topic"),
          }),
        )
        .setThumbnail(newChannel.guild.iconURL() ?? null)
        .setTimestamp();
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send channelUpdate embed in ${newChannel.guild.name} (${newChannel.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }
    if (oldChannel.isTextBased() && newChannel.isTextBased() && oldChannel.nsfw !== newChannel.nsfw) {
      embed
        .setColor("Yellow")
        .setTitle(t("nsfw_change.embed.title"))
        .setDescription(
          t("nsfw_change.embed.description", {
            channel: newChannel,
            old_nsfw: oldChannel.nsfw
              ? oldChannel.client.allEmojis.get(oldChannel.client.config.emojis.confirm.id)?.format
              : oldChannel.client.allEmojis.get(oldChannel.client.config.emojis.reject.id)?.format,
            new_nsfw: newChannel.nsfw
              ? newChannel.client.allEmojis.get(newChannel.client.config.emojis.confirm.id)?.format
              : newChannel.client.allEmojis.get(newChannel.client.config.emojis.reject.id)?.format,
          }),
        )
        .setThumbnail(newChannel.guild.iconURL() ?? null)
        .setTimestamp();

      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send channelUpdate embed in ${newChannel.guild.name} (${newChannel.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }
    const oldPerms = oldChannel.permissionOverwrites.cache.map((po) => ({
      id: po.id,
      type: po.type,
      allow: po.allow.bitfield,
      deny: po.deny.bitfield,
    }));

    const newPerms = newChannel.permissionOverwrites.cache.map((po) => ({
      id: po.id,
      type: po.type,
      allow: po.allow.bitfield,
      deny: po.deny.bitfield,
    }));
    console.log(oldPerms, newPerms);
    if (!isDeepStrictEqual(oldPerms, newPerms)) {
      embed
        .setColor("Yellow")
        .setTitle(t("permissions_change.embed.title"))
        .setDescription(
          t("permissions_change.embed.description", {
            channel: newChannel,
            changes: diffOverwrites(oldChannel.client, oldChannel, newChannel, guildConfig.language) || t("no_changes"),
          }),
        )
        .setThumbnail(newChannel.guild.iconURL() ?? null)
        .setTimestamp();
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send channelUpdate embed in ${newChannel.guild.name} (${newChannel.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }
  },
} satisfies EventBase<Events.ChannelUpdate>;
