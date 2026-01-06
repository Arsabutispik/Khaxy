import { ChannelType, EmbedBuilder, GuildSoundboardSound, time, TimestampStyles } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logSoundBoardSoundCreate(soundboardSound: GuildSoundboardSound, guildConfig: GuildWithLogs) {
  const t = soundboardSound.client.i18next.getFixedT(guildConfig.language, "events", "guildSoundboardSoundCreate");
  if (!guildConfig.logConfig?.soundboardLogsChannelId) return;
  const logChannel = soundboardSound.guild.channels.cache.get(guildConfig.logConfig.soundboardLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTimestamp()
    .setTitle(t("embed.title"))
    .setDescription(
      t("embed.description", {
        sound: soundboardSound,
        volume: Math.round(soundboardSound.volume * 100),
        timestamp: time(soundboardSound.createdAt, TimestampStyles.FullDateShortTime),
      }),
    );
  if (soundboardSound.user) {
    embed.setFooter({
      text: soundboardSound.user.username,
      iconURL: soundboardSound.user.displayAvatarURL(),
    });
  }
  const webhook = await returnWebhook(soundboardSound.client, logChannel, soundboardSound.guild.id, guildConfig, {
    id: guildConfig.logConfig.soundboardLogsChannelId,
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
      message: `Failed to send guildSoundboardSoundCreate embed in ${soundboardSound.guild.name} (${soundboardSound.guild.id})`,
      channelId: logChannel.id,
    });
  });
}
