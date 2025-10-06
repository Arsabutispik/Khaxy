import { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildSoundboardSoundUpdate,
  once: false,
  async execute(oldSoundboardSound, newSoundboardSound) {
    const guildConfig = await getGuildConfig(newSoundboardSound.guild.id);
    if (!guildConfig) return;
    const t = newSoundboardSound.client.i18next.getFixedT(guildConfig.language, "events", "guildSoundboardSoundUpdate");
    if (!guildConfig.soundboard_logs_channel_id) return;
    const logChannel = newSoundboardSound.guild.channels.cache.get(toStringId(guildConfig.soundboard_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder().setColor("Green").setTimestamp();
    const embeds: Array<EmbedBuilder> = [];
    const auditLogs = await newSoundboardSound.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.SoundboardSoundUpdate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    function isSoundboardSound(target: unknown): target is { soundId: string } {
      return typeof target === "object" && target !== null && "soundId" in target;
    }
    const targetId = isSoundboardSound(logEntry?.target) ? logEntry!.target.soundId : logEntry?.target?.id;

    if (targetId === newSoundboardSound.soundId) {
      embed.setFooter({
        text: logEntry?.executor?.username ?? t("unknown_executor"),
        iconURL: logEntry?.executor?.displayAvatarURL() ?? undefined,
      });
    }
    if (oldSoundboardSound?.volume !== newSoundboardSound.volume) {
      embed.setTitle(t("volume_change.embed.title")).setDescription(
        t("volume_change.embed.description", {
          sound: newSoundboardSound,
          old_volume: Math.round((oldSoundboardSound?.volume || 0) * 100),
          new_volume: Math.round(newSoundboardSound.volume * 100),
          timestamp: time(new Date(), TimestampStyles.LongDateTime),
        }),
      );
      embeds.push(embed);
    }
    if (oldSoundboardSound?.name !== newSoundboardSound.name) {
      embed.setTitle(t("name_change.embed.title")).setDescription(
        t("name_change.embed.description", {
          sound: newSoundboardSound,
          old_name: oldSoundboardSound?.name || t("no_previous_value"),
          new_name: newSoundboardSound.name,
          timestamp: time(new Date(), TimestampStyles.LongDateTime),
        }),
      );
      embeds.push(embed);
    }
    if (oldSoundboardSound?.emoji?.toString() !== newSoundboardSound.emoji?.toString()) {
      embed.setTitle(t("emoji_change.embed.title")).setDescription(
        t("emoji_change.embed.description", {
          sound: newSoundboardSound,
          old_emoji: oldSoundboardSound?.emoji?.toString() || t("no_previous_value"),
          new_emoji: newSoundboardSound.emoji?.toString() || t("no_emoji"),
          timestamp: time(new Date(), TimestampStyles.LongDateTime),
        }),
      );
      embeds.push(embed);
    }
    if (embeds.length === 0) return;
    const webhook = await returnWebhook(newSoundboardSound.client, logChannel, newSoundboardSound.guild.id, {
      id: guildConfig.soundboard_logs_webhook_id,
      type: WebhookType.SOUNDBOARD_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildSoundboardSoundUpdate embed in ${newSoundboardSound.guild.name} (${newSoundboardSound.guild.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildSoundboardSoundUpdate>;
