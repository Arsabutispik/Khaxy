import type { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { toStringId, modLog, returnWebhook, WebhookType } from "@utils";
import { getGuildConfig } from "@database";
import { logger } from "@lib";
import dayjs from "dayjs";

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember, newMember) {
    const guildConfig = await getGuildConfig(oldMember.guild.id);
    if (!guildConfig) return;
    const t = newMember.client.i18next.getFixedT(guildConfig.language, "events", "guildMemberUpdate");
    const auditLogs = await newMember.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberUpdate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    const logChannel = await newMember.guild.channels
      .fetch(toStringId(guildConfig.guild_member_logs_channel_id))
      .catch(() => null);
    if (
      newMember.isCommunicationDisabled() &&
      !oldMember.isCommunicationDisabled() &&
      logEntry?.executor?.id !== newMember.client.user.id &&
      logEntry?.target?.id === newMember.user.id &&
      dayjs().diff(logEntry?.createdAt, "seconds") < 3 &&
      logChannel?.type === ChannelType.GuildText
    ) {
      const embed = new EmbedBuilder()
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
      if (logEntry?.executor) {
        embed.setFooter({
          text: logEntry?.executor?.tag || t("unknown_executor"),
          iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
        });
      }
      const webhook = await returnWebhook(newMember.client, logChannel, newMember.guild.id, {
        id: guildConfig.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guildMemberUpdate embed in ${newMember.guild.name} (${newMember.guild.id})`,
          error,
          channelId: logChannel.id,
        });
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
    if (
      oldMember.isCommunicationDisabled() &&
      !newMember.isCommunicationDisabled() &&
      logEntry?.executor?.id !== newMember.client.user.id &&
      logChannel?.type === ChannelType.GuildText
    ) {
      const embed = new EmbedBuilder()
        .setTitle(t("remove_timeout.embed.title"))
        .setColor("Green")
        .setDescription(
          t("remove_timeout.embed.description", {
            user: newMember.user,
          }),
        )
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp();
      if (
        logEntry?.executor &&
        logEntry.target?.id === newMember.user.id &&
        dayjs().diff(logEntry.createdAt, "seconds") < 3
      ) {
        embed.setFooter({
          text: logEntry?.executor?.tag || t("unknown_executor"),
          iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
        });
      }
      const webhook = await returnWebhook(newMember.client, logChannel, newMember.guild.id, {
        id: guildConfig.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
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
    if (
      oldMember.roles.cache.size - newMember.roles.cache.size > 0 &&
      logEntry?.executor?.id !== newMember.client.user.id &&
      logChannel?.type === ChannelType.GuildText
    ) {
      const removedRoles = oldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));
      const embed = new EmbedBuilder()
        .setTitle(t("remove_roles.embed.title"))
        .setColor("Yellow")
        .setDescription(
          t("remove_roles.embed.description", {
            user: newMember.user,
            roles: removedRoles.map((role) => role.toString()).join(", "),
          }),
        )
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp();
      if (
        logEntry?.executor &&
        logEntry.target?.id === newMember.user.id &&
        dayjs().diff(logEntry.createdAt, "seconds") < 3
      ) {
        embed.setFooter({
          text: logEntry?.executor?.tag || t("unknown_executor"),
          iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
        });
      }
      const webhook = await returnWebhook(newMember.client, logChannel, newMember.guild.id, {
        id: guildConfig.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
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
    if (
      oldMember.roles.cache.size - newMember.roles.cache.size < 0 &&
      logEntry?.executor?.id !== newMember.client.user.id &&
      logChannel?.type === ChannelType.GuildText
    ) {
      const addedRoles = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));
      const embed = new EmbedBuilder()
        .setTitle(t("add_roles.embed.title"))
        .setColor("Green")
        .setDescription(
          t("add_roles.embed.description", {
            user: newMember.user,
            roles: addedRoles.map((role) => role.toString()).join(", "),
          }),
        )
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp();
      if (
        logEntry?.executor &&
        logEntry.target?.id === newMember.user.id &&
        dayjs().diff(logEntry.createdAt, "seconds") < 3
      ) {
        embed.setFooter({
          text: logEntry?.executor?.tag || t("unknown_executor"),
          iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
        });
      }
      const webhook = await returnWebhook(newMember.client, logChannel, newMember.guild.id, {
        id: guildConfig.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
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
    if (
      oldMember.nickname !== newMember.nickname &&
      logEntry?.executor?.id !== newMember.client.user.id &&
      logChannel?.type === ChannelType.GuildText
    ) {
      const embed = new EmbedBuilder()
        .setTitle(t("nickname_change.embed.title"))
        .setColor("Blue")
        .setDescription(
          t("nickname_change.embed.description", {
            user: newMember.user,
            old_nickname: oldMember.nickname || t("nickname_change.no_nickname"),
            new_nickname: newMember.nickname || t("nickname_change.no_nickname"),
          }),
        )
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp();
      if (
        logEntry?.executor &&
        logEntry.target?.id === newMember.user.id &&
        dayjs().diff(logEntry.createdAt, "seconds") < 3
      ) {
        embed.setFooter({
          text: logEntry?.executor?.tag || t("unknown_executor"),
          iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
        });
      }
      const webhook = await returnWebhook(newMember.client, logChannel, newMember.guild.id, {
        id: guildConfig.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
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
    if (
      oldMember.user.username !== newMember.user.username &&
      logEntry?.executor?.id !== newMember.client.user.id &&
      logChannel?.type === ChannelType.GuildText
    ) {
      const embed = new EmbedBuilder()
        .setTitle(t("username_change.embed.title"))
        .setColor("Blue")
        .setDescription(
          t("username_change.embed.description", {
            user: newMember.user,
            old_username: oldMember.user.username,
            new_username: newMember.user.username,
          }),
        )
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp();
      const webhook = await returnWebhook(newMember.client, logChannel, newMember.guild.id, {
        id: guildConfig.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
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
    if (oldMember.user.avatar !== newMember.user.avatar && logChannel?.type === ChannelType.GuildText) {
      const embed = new EmbedBuilder()
        .setTitle(t("avatar_change.embed.title"))
        .setColor("Blue")
        .setDescription(
          t("avatar_change.embed.description", {
            user: newMember.user,
          }),
        )
        .setThumbnail(newMember.user.displayAvatarURL())
        .setTimestamp();
      const webhook = await returnWebhook(newMember.client, logChannel, newMember.guild.id, {
        id: guildConfig.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
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
