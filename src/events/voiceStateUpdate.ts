import { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig, updateGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";
import dayjs from "dayjs";

export default {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild_config = await getGuildConfig(oldState.guild.id);
    if (!guild_config) return;
    const t = oldState.client.i18next.getFixedT(guild_config.language, "events", "voiceStateUpdate");
    if (guild_config.voice_logs_channel_id) {
      if (!oldState.channelId && newState.channelId) {
        const guild_logs_channel = await oldState.guild.channels
          .fetch(toStringId(guild_config.voice_logs_channel_id))
          .catch(() => null);
        if (guild_logs_channel?.type === ChannelType.GuildText) {
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
          const webhook = await returnWebhook(newState.client, guild_logs_channel, oldState.guild.id, {
            id: guild_config.voice_logs_webhook_id,
            type: WebhookType.VOICE_LOGS,
          });
          await webhook.send({ embeds: [embed] }).catch((error) => {
            logger.log({
              level: "error",
              error,
              message: `Failed to send voice state update embed in ${oldState.guild.name} (${oldState.guild.id})`,
            });
          });
        }
      }
      if (oldState.channelId && !newState.channelId) {
        const guild_logs_channel = await oldState.guild.channels
          .fetch(toStringId(guild_config.voice_logs_channel_id))
          .catch(() => null);
        if (guild_logs_channel?.type === ChannelType.GuildText) {
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
          const webhook = await returnWebhook(newState.client, guild_logs_channel, oldState.guild.id, {
            id: guild_config.voice_logs_webhook_id,
            type: WebhookType.VOICE_LOGS,
          });
          const audit_logs = await oldState.guild
            .fetchAuditLogs({
              limit: 1,
              type: AuditLogEvent.MemberDisconnect,
            })
            .catch(() => null);
          const audit_log = audit_logs?.entries.first();
          if (audit_log) {
            const age = Math.abs(dayjs().diff(audit_log.createdAt, "seconds"));
            const storedId = toStringId(guild_config.voice_audit_leave_logs_id);
            const storedCount = guild_config.voice_audit_leave_logs_count;

            const sameEntryUpdated = audit_log.id === storedId && audit_log.extra?.count > storedCount;

            const newRecentEntry = audit_log.id !== storedId && age < 3;

            if (sameEntryUpdated || newRecentEntry) {
              embed.setTitle(t("leave.embed.title_kicked"));
              embed.setFooter({
                text: audit_log?.executor?.tag || t("unknown_executor"),
                iconURL: audit_log?.executor?.displayAvatarURL(),
              });

              await updateGuildConfig(oldState.guild.id, {
                voice_audit_leave_logs_id: BigInt(audit_log.id),
                voice_audit_leave_logs_count: audit_log.extra?.count ?? 1,
              });
            }
          }
          await webhook.send({ embeds: [embed] }).catch((error) => {
            logger.log({
              level: "error",
              error,
              message: `Failed to send voice state update embed in ${oldState.guild.name} (${oldState.guild.id})`,
            });
          });
        }
      }
      if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const guild_logs_channel = await oldState.guild.channels
          .fetch(toStringId(guild_config.voice_logs_channel_id))
          .catch(() => null);
        if (guild_logs_channel?.type === ChannelType.GuildText) {
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
          const webhook = await returnWebhook(newState.client, guild_logs_channel, oldState.guild.id, {
            id: guild_config.voice_logs_webhook_id,
            type: WebhookType.VOICE_LOGS,
          });
          const audit_logs = await oldState.guild
            .fetchAuditLogs({
              limit: 1,
              type: AuditLogEvent.MemberMove,
            })
            .catch(() => null);
          const audit_log = audit_logs?.entries.first();
          if (audit_log) {
            const age = Math.abs(dayjs().diff(audit_log.createdAt, "seconds"));
            const storedId = toStringId(guild_config.voice_audit_move_logs_id);
            const storedCount = guild_config.voice_audit_move_logs_count;

            const sameEntryUpdated = audit_log.id === storedId && audit_log.extra?.count > storedCount;

            const newRecentEntry = audit_log.id !== storedId && age < 3;

            if (sameEntryUpdated || newRecentEntry) {
              embed.setTitle(t("move.embed.title"));
              embed.setFooter({
                text: audit_log?.executor?.tag || t("unknown_executor"),
                iconURL: audit_log?.executor?.displayAvatarURL(),
              });

              await updateGuildConfig(oldState.guild.id, {
                voice_audit_move_logs_id: BigInt(audit_log.id),
                voice_audit_move_logs_count: audit_log.extra?.count ?? 1,
              });
            }
          }
          await webhook.send({ embeds: [embed] }).catch((error) => {
            logger.log({
              level: "error",
              error,
              message: `Failed to send voice state update embed in ${oldState.guild.name} (${oldState.guild.id})`,
            });
          });
        }
      }
    }
  },
} satisfies EventBase<Events.VoiceStateUpdate>;
