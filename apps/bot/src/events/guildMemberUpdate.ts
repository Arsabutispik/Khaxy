import type { EventBase } from "src/types/index.js";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { toStringId, modLog, returnWebhook, WebhookType } from "src/utils/index.js";
import { getGuildConfig } from "src/database/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember, newMember) {
    const guildConfig = await getGuildConfig(oldMember.guild.id);
    if (!guildConfig) return;
    if (oldMember.partial) oldMember = await oldMember.fetch();
    const logChannel = newMember.guild.channels.cache.get(toStringId(guildConfig.guild_member_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const t = newMember.client.i18next.getFixedT(guildConfig.language, "events", "guildMemberUpdate");
    async function auditLogs<T extends AuditLogEvent>(type: T) {
      const auditLogs = await newMember.guild
        .fetchAuditLogs({
          limit: 1,
          type,
        })
        .catch(() => null);
      return auditLogs?.entries.first();
    }
    const webhook = await returnWebhook(newMember.client, logChannel, newMember.guild.id, {
      id: guildConfig.guild_member_logs_webhook_id,
      type: WebhookType.GUILD_MEMBER_LOGS,
    });
    const embed = new EmbedBuilder();

    if (newMember.isCommunicationDisabled() && !oldMember.isCommunicationDisabled()) {
      const logEntry = await auditLogs(AuditLogEvent.MemberUpdate);
      if (!(logEntry?.target?.id !== newMember.user.id) || logEntry?.executor?.id === newMember.client.user.id) return;
      embed
        .setTitle(t("timeout.embed.title"))
        .setColor("Yellow")
        .setDescription(
          t("timeout.embed.description", {
            user: newMember.user,
            timestamp: time(newMember.communicationDisabledUntil, TimestampStyles.LongDateTime),
          }),
        )
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp()
        .addFields([
          {
            name: t("timeout.embed.fields.reason"),
            value: logEntry?.reason || t("timeout.no_reason"),
          },
        ]);
      if (logEntry?.target?.id === newMember.user.id) {
        embed.setFooter({
          text: logEntry?.executor?.tag || t("unknown_executor"),
          iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
        });
        await modLog(
          {
            action: "TIMEOUT",
            moderator: logEntry?.executor ?? null,
            guild: newMember.guild,
            user: newMember.user,
            reason: logEntry?.reason || t("timeout.no_reason"),
          },
          newMember.client,
        );
      }
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guildMemberUpdate embed in ${newMember.guild.name} (${newMember.guild.id})`,
          error,
          channelId: logChannel.id,
        });
      });
    }
    if (oldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {
      const logEntry = await auditLogs(AuditLogEvent.MemberUpdate);
      if (!(logEntry?.target?.id !== newMember.user.id) || logEntry?.executor?.id === newMember.client.user.id) return;
      embed
        .setTitle(t("remove_timeout.embed.title"))
        .setColor("Green")
        .setDescription(
          t("remove_timeout.embed.description", {
            user: newMember.user,
          }),
        )
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: logEntry?.executor?.tag || t("unknown_executor"),
          iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
        });

      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guildMemberUpdate embed in ${newMember.guild.name} (${newMember.guild.id})`,
          error,
          channelId: logChannel.id,
        });
      });
    }
    const removedRoles = oldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));
    const addedRoles = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));

    if ((removedRoles.size > 0 || addedRoles.size > 0) && logChannel?.type === ChannelType.GuildText) {
      const logEntry = await auditLogs(AuditLogEvent.MemberRoleUpdate);
      if (!(logEntry?.target?.id !== newMember.user.id) || logEntry?.executor?.id === newMember.client.user.id) return;
      embed
        .setTitle(t("roles_update.embed.title"))
        .setColor("Yellow")
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: logEntry?.executor?.tag || t("unknown_executor"),
          iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
        });

      let description = t("roles_update.embed.description", { user: newMember.user });

      if (addedRoles.size > 0) {
        description += `\n> **${t("roles_update.embed.added")}**: ${addedRoles.map((r) => r.toString()).join(", ")}`;
      }

      if (removedRoles.size > 0) {
        description += `\n> **${t("roles_update.embed.removed")}**: ${removedRoles.map((r) => r.toString()).join(", ")}`;
      }

      embed.setDescription(description);

      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guildMemberUpdate embed in ${newMember.guild.name} (${newMember.guild.id})`,
          error,
          channelId: logChannel.id,
        });
      });
    }

    if (oldMember.nickname !== newMember.nickname && logChannel?.type === ChannelType.GuildText) {
      const logEntry = await auditLogs(AuditLogEvent.MemberUpdate);
      if (!(logEntry?.target?.id !== newMember.user.id) || logEntry?.executor?.id === newMember.client.user.id) return;
      embed
        .setTitle(t("nickname_change.embed.title"))
        .setColor("Blue")
        .setDescription(
          t("nickname_change.embed.description", {
            user: newMember.user,
            old_nickname: oldMember.nickname || oldMember.displayName || t("nickname_change.no_nickname"),
            new_nickname: newMember.nickname || newMember.displayName || t("nickname_change.no_nickname"),
          }),
        )
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: logEntry?.executor?.tag || t("unknown_executor"),
          iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
        });

      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guildMemberUpdate embed in ${newMember.guild.name} (${newMember.guild.id})`,
          error,
          channelId: logChannel.id,
        });
      });
    }
  },
} satisfies EventBase<Events.GuildMemberUpdate>;
