import { EventBase } from "src/types/index.js";
import { ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.GuildSoundboardSoundCreate,
  once: false,
  async execute(soundboardSound) {
    const guildConfig = await getGuildConfig(soundboardSound.guild.id);
    if (!guildConfig) return;
    const t = soundboardSound.client.i18next.getFixedT(guildConfig.language, "events", "guildSoundboardSoundCreate");
    if (!guildConfig.soundboard_logs_channel_id) return;
    const logChannel = soundboardSound.guild.channels.cache.get(toStringId(guildConfig.soundboard_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTimestamp()
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
          sound: soundboardSound,
          volume: Math.round(soundboardSound.volume * 100),
          timestamp: time(soundboardSound.createdAt, TimestampStyles.LongDateTime),
        }),
      );
    if (soundboardSound.user) {
      embed.setFooter({
        text: soundboardSound.user.username,
        iconURL: soundboardSound.user.displayAvatarURL(),
      });
    }
    const webhook = await returnWebhook(soundboardSound.client, logChannel, soundboardSound.guild.id, {
      id: guildConfig.soundboard_logs_webhook_id,
      type: WebhookType.SOUNDBOARD_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildSoundboardSoundCreate embed in ${soundboardSound.guild.name} (${soundboardSound.guild.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildSoundboardSoundCreate>;
