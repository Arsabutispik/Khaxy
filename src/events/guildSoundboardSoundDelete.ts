import { EventBase } from "src/types/index.js";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.GuildSoundboardSoundDelete,
  once: false,
  async execute(soundboardSound) {
    if (!soundboardSound.guild) return;
    const guildConfig = await getGuildConfig(soundboardSound.guild.id);
    if (!guildConfig) return;
    const t = soundboardSound.client.i18next.getFixedT(guildConfig.language, "events", "guildSoundboardSoundDelete");
    if (!guildConfig.soundboard_logs_channel_id) return;
    const logChannel = soundboardSound.guild.channels.cache.get(toStringId(guildConfig.soundboard_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTimestamp()
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
          soundboard: soundboardSound,
          volume: Math.round((soundboardSound.volume || 0) * 100),
          timestamp: time(new Date(), TimestampStyles.LongDateTime),
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
        text: logEntry?.executor?.username ?? t("unknown_executor"),
        iconURL: logEntry?.executor?.displayAvatarURL() ?? undefined,
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
        message: `Failed to send guildSoundboardSoundDelete embed in ${soundboardSound.guild?.name} (${soundboardSound.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildSoundboardSoundDelete>;
