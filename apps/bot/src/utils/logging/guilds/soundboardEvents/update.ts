import { AuditLogEvent, ChannelType, EmbedBuilder, GuildSoundboardSound, time, TimestampStyles } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logSoundboardSoundUpdate(oldSoundboardSound: GuildSoundboardSound | null, newSoundboardSound: GuildSoundboardSound, guildConfig: GuildWithLogs) {
  const t = newSoundboardSound.client.i18next.getFixedT(guildConfig.language, "events", "guildSoundboardSoundUpdate");
  if (!guildConfig.logConfig?.soundboardLogsChannelId) return;
  const logChannel = newSoundboardSound.guild.channels.cache.get(guildConfig.logConfig.soundboardLogsChannelId);
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
      text: logEntry?.executor?.username ?? t(($) => $.unknown_executor),
      iconURL: logEntry?.executor?.displayAvatarURL() ?? undefined,
    });
  }
  if (oldSoundboardSound?.volume !== newSoundboardSound.volume) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.volume_change.embed.title))
      .setDescription(
        t(($) => $.volume_change.embed.description, {
          sound: newSoundboardSound,
          old_volume: Math.round((oldSoundboardSound?.volume || 0) * 100),
          new_volume: Math.round(newSoundboardSound.volume * 100),
          timestamp: time(new Date(), TimestampStyles.FullDateShortTime),
        }),
      );
    embeds.push(embedClone);
  }
  if (oldSoundboardSound?.name !== newSoundboardSound.name) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.name_change.embed.title))
      .setDescription(
        t(($) => $.name_change.embed.description, {
          sound: newSoundboardSound,
          old_name: oldSoundboardSound?.name || t("no_previous_value"),
          new_name: newSoundboardSound.name,
          timestamp: time(new Date(), TimestampStyles.FullDateShortTime),
        }),
      );
    embeds.push(embedClone);
  }
  if (oldSoundboardSound?.emoji?.toString() !== newSoundboardSound.emoji?.toString()) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.emoji_change.embed.title))
      .setDescription(
        t(($) => $.emoji_change.embed.description, {
          sound: newSoundboardSound,
          old_emoji: oldSoundboardSound?.emoji?.toString() || t("no_previous_value"),
          new_emoji: newSoundboardSound.emoji?.toString() || t("no_emoji"),
          timestamp: time(new Date(), TimestampStyles.FullDateShortTime),
        }),
      );
    embeds.push(embedClone);
  }
  if (embeds.length === 0) return;
  const webhook = await returnWebhook(newSoundboardSound.client, logChannel, newSoundboardSound.guild.id, guildConfig, {
    id: guildConfig.logConfig.soundboardLogsWebhookId,
    type: WebhookType.SOUNDBOARD_LOGS,
  });
  if(webhook) {
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildSoundboardSoundUpdate embed in ${newSoundboardSound.guild.name} (${newSoundboardSound.guild.id})`,
        channelId: logChannel.id,
      });
    });
  }
}