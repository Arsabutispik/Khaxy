import { AuditLogEvent, ChannelType, EmbedBuilder, GuildSoundboardSound, time, TimestampStyles } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logSoundBoardSoundDelete(soundboardSound: GuildSoundboardSound, guildConfig: GuildWithLogs) {
  const t = soundboardSound.client.i18next.getFixedT(guildConfig.language, "events", "guildSoundboardSoundDelete");
  if (!guildConfig.logConfig?.soundboardLogsChannelId) return;
  const logChannel = soundboardSound.guild.channels.cache.get(guildConfig.logConfig.soundboardLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTimestamp()
    .setTitle(t(($) => $.embed.title))
    .setDescription(
      t(($) => $.embed.description, {
        soundboard: soundboardSound,
        volume: Math.round((soundboardSound.volume || 0) * 100),
        timestamp: time(new Date(), TimestampStyles.FullDateShortTime),
      }),
    );
  const auditLogs = await soundboardSound.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.SoundboardSoundDelete,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  function isSoundboardSound(target: unknown): target is { soundId: string } {
    return typeof target === "object" && target !== null && "soundId" in target;
  }
  const targetId = isSoundboardSound(logEntry?.target) ? logEntry!.target.soundId : logEntry?.target?.id;

  if (targetId === soundboardSound.soundId) {
    embed.setFooter({
      text: logEntry?.executor?.username ?? t(($) => $.unknown_executor),
      iconURL: logEntry?.executor?.displayAvatarURL() ?? undefined,
    });
  }
  const webhook = await returnWebhook(soundboardSound.client, logChannel, soundboardSound.guild.id, guildConfig, {
    id: guildConfig.logConfig.soundboardLogsWebhookId,
    type: WebhookType.SOUNDBOARD_LOGS,
  });
  if (!webhook) {
    logger.log({
      level: "warn",
      message: `SoundBoard Webhook could not be found or created for ${soundboardSound.guild.name} (${soundboardSound.guild.name})`,
    });
    return;
  }
  await webhook.send({ embeds: [embed] }).catch((error) => {
    logger.log({
      level: "error",
      error,
      message: `Failed to send guildSoundboardSoundDelete embed in ${soundboardSound.guild?.name} (${soundboardSound.guild?.id})`,
      channelId: logChannel.id,
    });
  });
}
