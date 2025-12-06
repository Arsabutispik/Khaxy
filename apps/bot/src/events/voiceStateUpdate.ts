import { EventBase } from "src/types/index.js";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig, updateGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";
import dayjs from "dayjs";

export default {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guildConfig = await getGuildConfig(oldState.guild.id);
    if (!guildConfig) return;
    const logChannel = newState.guild.channels.cache.get(toStringId(guildConfig.voice_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const webhook = await returnWebhook(newState.client, logChannel, oldState.guild.id, {
      id: guildConfig.voice_logs_webhook_id,
      type: WebhookType.VOICE_LOGS,
    });
    const t = oldState.client.i18next.getFixedT(guildConfig.language, "events", "voiceStateUpdate");
    if (!oldState.channelId && newState.channelId) {
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(t("join.embed.title"))
        .setDescription(
          t("join.embed.description", {
            user: newState.member?.user,
            channel: newState.channel,
            timestamp: time(new Date(), TimestampStyles.LongDateTime),
          }),
        )
        .setThumbnail(newState.member?.user.displayAvatarURL() ?? null)
        .setTimestamp();

      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send voiceStateUpdate embed in ${oldState.guild.name} (${oldState.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }
    if (oldState.channelId && !newState.channelId) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(t("leave.embed.title"))
        .setDescription(
          t("leave.embed.description", {
            user: oldState.member?.user,
            channel: oldState.channel,
            timestamp: time(new Date(), TimestampStyles.LongDateTime),
          }),
        )
        .setThumbnail(oldState.member?.user.displayAvatarURL() ?? null)
        .setTimestamp();
      const auditLogs = await oldState.guild
        .fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberDisconnect,
        })
        .catch(() => null);
      const logEntry = auditLogs?.entries.first();
      if (logEntry) {
        const age = Math.abs(dayjs().diff(logEntry.createdAt, "seconds"));
        const storedId = toStringId(guildConfig.voice_audit_leave_logs_id);
        const storedCount = guildConfig.voice_audit_leave_logs_count;

        const sameEntryUpdated = logEntry.id === storedId && logEntry.extra?.count > storedCount;

        const newRecentEntry = logEntry.id !== storedId && age < 3;

        if (sameEntryUpdated || newRecentEntry) {
          embed.setTitle(t("leave.embed.title_kicked"));
          embed.setFooter({
            text: logEntry?.executor?.tag || t("unknown_executor"),
            iconURL: logEntry?.executor?.displayAvatarURL(),
          });

          await updateGuildConfig(oldState.guild.id, {
            voice_audit_leave_logs_id: BigInt(logEntry.id),
            voice_audit_leave_logs_count: logEntry.extra?.count ?? 1,
          });
        }
      }
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send voiceStateUpdate embed in ${oldState.guild.name} (${oldState.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle(t("move.embed.title"))
        .setDescription(
          t("move.embed.description", {
            user: oldState.member?.user,
            oldChannel: oldState.channel,
            newChannel: newState.channel,
            timestamp: time(new Date(), TimestampStyles.LongDateTime),
          }),
        )
        .setThumbnail(oldState.member?.user.displayAvatarURL() ?? null)
        .setTimestamp();
      const auditLogs = await oldState.guild
        .fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberMove,
        })
        .catch(() => null);
      const logEntry = auditLogs?.entries.first();
      if (logEntry) {
        const age = Math.abs(dayjs().diff(logEntry.createdAt, "seconds"));
        const storedId = toStringId(guildConfig.voice_audit_move_logs_id);
        const storedCount = guildConfig.voice_audit_move_logs_count;

        const sameEntryUpdated = logEntry.id === storedId && logEntry.extra?.count > storedCount;

        const newRecentEntry = logEntry.id !== storedId && age < 3;

        if (sameEntryUpdated || newRecentEntry) {
          embed.setTitle(t("move.embed.title"));
          embed.setFooter({
            text: logEntry?.executor?.tag || t("unknown_executor"),
            iconURL: logEntry?.executor?.displayAvatarURL(),
          });

          await updateGuildConfig(oldState.guild.id, {
            voice_audit_move_logs_id: BigInt(logEntry.id),
            voice_audit_move_logs_count: logEntry.extra?.count ?? 1,
          });
        }
      }
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send voiceStateUpdate embed in ${oldState.guild.name} (${oldState.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }
  },
} satisfies EventBase<Events.VoiceStateUpdate>;
