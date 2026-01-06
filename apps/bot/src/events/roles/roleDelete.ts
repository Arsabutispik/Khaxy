import { EventBase } from "@types";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildRoleDelete,
  once: false,
  async execute(role) {
    const guildConfig = await getGuildConfig(role.guild.id);
    if (!guildConfig) return;
    const t = role.client.i18next.getFixedT(guildConfig.language, "events", "roleDelete");
    if (!guildConfig.role_logs_channel_id) return;
    const logChannel = role.guild.channels.cache.get(toStringId(guildConfig.role_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const auditLogs = await role.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.RoleDelete,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
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
            return t(`permissions.${permission}`);
          }),
          timestamp: time(new Date(), TimestampStyles.ShortDateTime),
        }),
      )
      .setThumbnail(role.iconURL() ?? role.guild.iconURL() ?? null)
      .setTimestamp();
    if (logEntry?.target?.id === role.id) {
      embed.setFooter({
        text: logEntry.executor?.tag ?? t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
      });
    }
    const webhook = await returnWebhook(role.client, logChannel, role.guild.id, {
      id: guildConfig.role_logs_webhook_id,
      type: WebhookType.ROLE_LOGS,
    });
    await webhook
      .send({
        embeds: [embed],
      })
      .catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send roleDelete embed in ${role.guild.name} (${role.guild.id})`,
          channel: logChannel.id,
        });
      });
  },
} satisfies EventBase<Events.GuildRoleDelete>;
