import type { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { toStringId, modlog, returnWebhook, WebhookType } from "@utils";
import { getGuildConfig } from "@database";
import { logger } from "@lib";
import dayjs from "dayjs";

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember, newMember) {
    const guild_config = await getGuildConfig(oldMember.guild.id);
    if (!guild_config) return;
    const t = newMember.client.i18next.getFixedT(guild_config.language, "events", "guildMemberUpdate");
    const audit_logs = await newMember.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberUpdate,
      })
      .catch(() => null);
    const audit_log = audit_logs?.entries.first();
    const guild_member_logs_channel = await newMember.guild.channels
      .fetch(toStringId(guild_config.guild_member_logs_channel_id))
      .catch(() => null);
    if (
      newMember.isCommunicationDisabled() &&
      !oldMember.isCommunicationDisabled() &&
      audit_log?.executor?.id !== newMember.client.user.id &&
      guild_member_logs_channel?.type === ChannelType.GuildText
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
            value: audit_log?.reason || t("timeout.no_reason"),
          },
        ]);
      if (
        audit_log?.executor &&
        audit_log.target?.id === newMember.user.id &&
        dayjs().diff(audit_log.createdAt, "seconds") < 3
      ) {
        embed.setFooter({
          text: audit_log?.executor?.tag || t("unknown_executor"),
          iconURL: audit_log?.executor?.displayAvatarURL() || undefined,
        });
      }
      const webhook = await returnWebhook(newMember.client, guild_member_logs_channel, newMember.guild.id, {
        id: guild_config.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guild member timeout log: ${error.message}`,
          error,
          context: {
            guildId: newMember.guild.id,
            userId: newMember.user.id,
          },
        });
      });
      await modlog(
        {
          action: "TIMEOUT",
          moderator: audit_log?.executor ?? null,
          guild: newMember.guild,
          user: newMember.user,
          reason: audit_log?.reason || t("timeout.no_reason"),
        },
        newMember.client,
      );
    }
    if (
      oldMember.isCommunicationDisabled() &&
      !newMember.isCommunicationDisabled() &&
      audit_log?.executor?.id !== newMember.client.user.id &&
      guild_member_logs_channel?.type === ChannelType.GuildText
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
        audit_log?.executor &&
        audit_log.target?.id === newMember.user.id &&
        dayjs().diff(audit_log.createdAt, "seconds") < 3
      ) {
        embed.setFooter({
          text: audit_log?.executor?.tag || t("unknown_executor"),
          iconURL: audit_log?.executor?.displayAvatarURL() || undefined,
        });
      }
      const webhook = await returnWebhook(newMember.client, guild_member_logs_channel, newMember.guild.id, {
        id: guild_config.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guild member remove timeout log: ${error.message}`,
          error,
          context: {
            guildId: newMember.guild.id,
            userId: newMember.user.id,
          },
        });
      });
    }
    if (
      oldMember.roles.cache.size - newMember.roles.cache.size > 0 &&
      audit_log?.executor?.id !== newMember.client.user.id &&
      guild_member_logs_channel?.type === ChannelType.GuildText
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
        audit_log?.executor &&
        audit_log.target?.id === newMember.user.id &&
        dayjs().diff(audit_log.createdAt, "seconds") < 3
      ) {
        embed.setFooter({
          text: audit_log?.executor?.tag || t("unknown_executor"),
          iconURL: audit_log?.executor?.displayAvatarURL() || undefined,
        });
      }
      const webhook = await returnWebhook(newMember.client, guild_member_logs_channel, newMember.guild.id, {
        id: guild_config.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guild member update log: ${error.message}`,
          error,
          context: {
            guildId: newMember.guild.id,
            userId: newMember.user.id,
          },
        });
      });
    }
    if (
      oldMember.roles.cache.size - newMember.roles.cache.size < 0 &&
      audit_log?.executor?.id !== newMember.client.user.id &&
      guild_member_logs_channel?.type === ChannelType.GuildText
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
        audit_log?.executor &&
        audit_log.target?.id === newMember.user.id &&
        dayjs().diff(audit_log.createdAt, "seconds") < 3
      ) {
        embed.setFooter({
          text: audit_log?.executor?.tag || t("unknown_executor"),
          iconURL: audit_log?.executor?.displayAvatarURL() || undefined,
        });
      }
      const webhook = await returnWebhook(newMember.client, guild_member_logs_channel, newMember.guild.id, {
        id: guild_config.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guild member update log: ${error.message}`,
          error,
          context: {
            guildId: newMember.guild.id,
            userId: newMember.user.id,
          },
        });
      });
    }
    if (
      oldMember.nickname !== newMember.nickname &&
      audit_log?.executor?.id !== newMember.client.user.id &&
      guild_member_logs_channel?.type === ChannelType.GuildText
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
        audit_log?.executor &&
        audit_log.target?.id === newMember.user.id &&
        dayjs().diff(audit_log.createdAt, "seconds") < 3
      ) {
        embed.setFooter({
          text: audit_log?.executor?.tag || t("unknown_executor"),
          iconURL: audit_log?.executor?.displayAvatarURL() || undefined,
        });
      }
      const webhook = await returnWebhook(newMember.client, guild_member_logs_channel, newMember.guild.id, {
        id: guild_config.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guild member nickname change log: ${error.message}`,
          error,
          context: {
            guildId: newMember.guild.id,
            userId: newMember.user.id,
          },
        });
      });
    }
    if (
      oldMember.user.username !== newMember.user.username &&
      audit_log?.executor?.id !== newMember.client.user.id &&
      guild_member_logs_channel?.type === ChannelType.GuildText
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
      const webhook = await returnWebhook(newMember.client, guild_member_logs_channel, newMember.guild.id, {
        id: guild_config.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guild member username change log: ${error.message}`,
          error,
          context: {
            guildId: newMember.guild.id,
            userId: newMember.user.id,
          },
        });
      });
    }
    if (oldMember.user.avatar !== newMember.user.avatar && guild_member_logs_channel?.type === ChannelType.GuildText) {
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
      const webhook = await returnWebhook(newMember.client, guild_member_logs_channel, newMember.guild.id, {
        id: guild_config.guild_member_logs_webhook_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send guild member avatar change log: ${error.message}`,
          error,
          context: {
            guildId: newMember.guild.id,
            userId: newMember.user.id,
          },
        });
      });
    }
  },
} satisfies EventBase<Events.GuildMemberUpdate>;
