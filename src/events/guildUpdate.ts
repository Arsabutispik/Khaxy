import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { EventBase } from "@customTypes";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import dayjs from "dayjs";
import { logger } from "@lib";

export default {
  name: Events.GuildUpdate,
  once: false,
  async execute(oldGuild, newGuild) {
    const guild_config = await getGuildConfig(newGuild.id);
    if (!guild_config) return;
    const t = newGuild.client.i18next.getFixedT(guild_config.language, "events", "guildUpdate");
    if (guild_config.guild_logs_channel_id) {
      if (oldGuild.name !== newGuild.name) {
        const guild_logs_channel = await newGuild.channels
          .fetch(toStringId(guild_config.guild_logs_channel_id))
          .catch(() => null);
        if (guild_logs_channel?.type === ChannelType.GuildText) {
          const audit_logs = await newGuild
            .fetchAuditLogs({
              limit: 1,
              type: AuditLogEvent.GuildUpdate,
            })
            .catch(() => null);
          const audit_log = audit_logs?.entries.first();
          if (audit_log?.executor?.id !== newGuild.client.user.id) {
            const embed = new EmbedBuilder()
              .setColor("Yellow")
              .setTitle(t("name_change.embed.title"))
              .setDescription(
                t("name_change.embed.description", {
                  old_name: oldGuild.name,
                  new_name: newGuild.name,
                }),
              )
              .setThumbnail(newGuild.iconURL())
              .setTimestamp();
            if (audit_log?.executor && dayjs().diff(audit_log.createdAt, "seconds") < 3) {
              embed.setFooter({
                text: audit_log.executor.tag || t("unknown_executor"),
                iconURL: audit_log.executor.displayAvatarURL(),
              });
            }
            const webhook = await returnWebhook(newGuild.client, guild_logs_channel, newGuild.id, {
              id: guild_config.guild_logs_webhook_id,
              type: WebhookType.GUILD_LOGS,
            });
            await webhook.send({ embeds: [embed] }).catch((error) => {
              logger.log({
                level: "error",
                error,
                message: `Failed to send guild update embed in ${newGuild.name} (${newGuild.id})`,
              });
            });
          }
        }
      }
    }
  },
} satisfies EventBase<Events.GuildUpdate>;
