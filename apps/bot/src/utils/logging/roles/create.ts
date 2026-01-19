import { Role, ChannelType, AuditLogEvent, EmbedBuilder, time, TimestampStyles } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logRoleCreate(role: Role, guildConfig: GuildWithLogs) {
  const t = role.client.i18next.getFixedT(guildConfig.language, "loggers", "roleEvents");
  if (!guildConfig.logConfig?.roleLogsChannelId) return;
  const logChannel = role.guild.channels.cache.get(guildConfig.logConfig.roleLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const auditLogs = await role.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleCreate,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle(t(($) => $.roleCreate.embed.title))
    .setDescription(
      t(($) => $.roleCreate.embed.description, {
        role: role,
        role_color: `#${role.color.toString(16).padStart(6, "0")}`,
        role_hoist: role.hoist
          ? role.client.allEmojis.get(role.client.config.emojis.confirm.id)?.format
          : role.client.allEmojis.get(role.client.config.emojis.reject.id)?.format,
        role_mentionable: role.mentionable
          ? role.client.allEmojis.get(role.client.config.emojis.confirm.id)?.format
          : role.client.allEmojis.get(role.client.config.emojis.reject.id)?.format,
        permissions: role.permissions.toArray().map((permission) => {
          const t = role.client.i18next.getFixedT(guildConfig.language, "permissions");
          return t(($) => $.permissions[permission] || permission);
        }),
        timestamp: time(role.createdAt, TimestampStyles.LongDateShortTime),
      }),
    )
    .setThumbnail(role.iconURL() ?? role.guild.iconURL() ?? null)
    .setTimestamp();
  if (logEntry?.target?.id === role.id) {
    embed.setFooter({
      text: logEntry.executor?.tag ?? t(($) => $.unknownExecutor),
      iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
    });
  }
  const webhook = await returnWebhook(role.client, logChannel, role.guild.id, guildConfig, {
    id: guildConfig.logConfig.roleLogsWebhookId,
    type: WebhookType.ROLE_LOGS,
  });
  if (webhook) {
    await webhook
      .send({
        embeds: [embed],
      })
      .catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send roleCreate embed in ${role.guild.name} (${role.guild.id})`,
          channel: logChannel.id,
        });
      });
  }
}
