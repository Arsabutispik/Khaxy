import { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "@database";
import { diffPermissions, returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildRoleUpdate,
  once: false,
  async execute(oldRole, newRole) {
    const guildConfig = await getGuildConfig(newRole.guild.id);
    if (!guildConfig) return;
    const t = newRole.client.i18next.getFixedT(guildConfig.language, "events", "roleUpdate");
    if (!guildConfig.role_logs_channel_id) return;
    const logChannel = newRole.guild.channels.cache.get(toStringId(guildConfig.role_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const auditLogs = await newRole.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.RoleUpdate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    let embeds: Array<EmbedBuilder> = [];
    const embed = new EmbedBuilder().setThumbnail(newRole.iconURL() ?? newRole.guild.iconURL() ?? null).setTimestamp();
    if (logEntry?.target.id === newRole.id) {
      embed.setFooter({
        text: logEntry.executor?.username ?? t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
      });
    }
    const webhook = await returnWebhook(newRole.client, logChannel, newRole.guild.id, {
      id: guildConfig.role_logs_webhook_id,
      type: WebhookType.ROLE_LOGS,
    });
    //Discord fires RoleUpdate twice if the position is changed alongside any other changes. We don't want to spam the logs with this.
    if (oldRole.rawPosition !== newRole.rawPosition) return;
    if (oldRole.name !== newRole.name) {
      embed
        .setTitle(t("name_change.embed.title"))
        .setColor("Yellow")
        .setDescription(
          t("name_change.embed.description", {
            role: newRole,
            old_name: oldRole.name,
            new_name: newRole.name,
          }),
        );
      embeds.push(embed);
    }
    if (oldRole.color !== newRole.color) {
      embed
        .setColor("Yellow")
        .setTitle(t("color_change.embed.title"))
        .setDescription(
          t("color_change.embed.description", {
            role: newRole,
            old_color: `#${oldRole.color.toString(16).padStart(6, "0")}`,
            new_color: `#${newRole.color.toString(16).padStart(6, "0")}`,
          }),
        );
      embeds.push(embed);
    }
    if (oldRole.hoist !== newRole.hoist) {
      embed
        .setColor("Yellow")
        .setTitle(t("hoist_change.embed.title"))
        .setDescription(
          t("hoist_change.embed.description", {
            role: newRole,
            old_hoist: oldRole.hoist
              ? oldRole.client.allEmojis.get(oldRole.client.config.emojis.confirm.id)?.format
              : oldRole.client.allEmojis.get(oldRole.client.config.emojis.reject.id)?.format,
            new_hoist: newRole.hoist
              ? newRole.client.allEmojis.get(newRole.client.config.emojis.confirm.id)?.format
              : newRole.client.allEmojis.get(newRole.client.config.emojis.reject.id)?.format,
          }),
        );
      embeds.push(embed);
    }
    if (oldRole.mentionable !== newRole.mentionable) {
      embed
        .setColor("Yellow")
        .setTitle(t("mentionable_change.embed.title"))
        .setDescription(
          t("mentionable_change.embed.description", {
            role: newRole,
            old_mentionable: oldRole.mentionable
              ? oldRole.client.allEmojis.get(oldRole.client.config.emojis.confirm.id)?.format
              : oldRole.client.allEmojis.get(oldRole.client.config.emojis.reject.id)?.format,
            new_mentionable: newRole.mentionable
              ? newRole.client.allEmojis.get(newRole.client.config.emojis.confirm.id)?.format
              : newRole.client.allEmojis.get(newRole.client.config.emojis.reject.id)?.format,
          }),
        );
      embeds.push(embed);
    }
    if (oldRole.permissions.toArray().sort().join(",") !== newRole.permissions.toArray().sort().join(",")) {
      embed
        .setColor("Yellow")
        .setTitle(t("permissions_change.embed.title"))
        .setDescription(
          t("permissions_change.embed.description", {
            role: newRole,
            changes: diffPermissions(newRole.client, oldRole, newRole, guildConfig.language),
          }),
        );
      embeds.push(embed);
    }
    if (oldRole.icon !== newRole.icon) {
      embed
        .setColor("Yellow")
        .setTitle(t("icon_change.embed.title"))
        .setDescription(
          t("icon_change.embed.description", {
            role: newRole,
            old_icon: oldRole.iconURL() ?? "N/A",
            new_icon: newRole.iconURL() ?? "N/A",
          }),
        );
      embeds.push(embed);
    }
    if (embeds.length > 0) {
      webhook.send({ embeds }).catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send roleUpdate embed(s) in ${newRole.guild.name} (${newRole.guild.id})`,
          error,
          channel: logChannel.id,
        });
      });
    }
  },
} satisfies EventBase<Events.GuildRoleUpdate>;
