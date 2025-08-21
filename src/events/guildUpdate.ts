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
    const guildConfig = await getGuildConfig(newGuild.id);
    if (!guildConfig) return;
    const logsChannel = newGuild.channels.cache.get(toStringId(guildConfig.guild_logs_channel_id));
    if (logsChannel?.type !== ChannelType.GuildText) return;
    const auditLogs = await newGuild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.GuildUpdate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    if (logEntry?.executor?.id === newGuild.client.user.id) return;
    const webhook = await returnWebhook(newGuild.client, logsChannel, newGuild.id, {
      id: guildConfig.guild_logs_webhook_id,
      type: WebhookType.GUILD_LOGS,
    });
    const t = newGuild.client.i18next.getFixedT(guildConfig.language, "events", "guildUpdate");
    const embed = new EmbedBuilder();
    if (logEntry?.executor && dayjs().diff(logEntry.createdAt, "seconds") < 3) {
      embed.setFooter({
        text: logEntry.executor.tag || t("unknown_executor"),
        iconURL: logEntry.executor.displayAvatarURL(),
      });
    }
    if (oldGuild.name !== newGuild.name) {
      embed
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

      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send guildUpdate embed in ${newGuild.name} (${newGuild.id})`,
          channelId: logsChannel.id,
        });
      });
    }
  },
} satisfies EventBase<Events.GuildUpdate>;
