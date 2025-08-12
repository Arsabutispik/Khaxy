import type { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { logger } from "@lib";
import { toStringId, modLog, returnWebhook, WebhookType } from "@utils";
import { getGuildConfig } from "@database";

export default {
  name: Events.GuildBanRemove,
  async execute(ban) {
    // Fetch guild data from the database
    const guildConfig = await getGuildConfig(ban.guild.id);

    // If no guild data is found, exit the function
    if (!guildConfig) return;
    const t = ban.client.i18next.getFixedT(guildConfig.language, "events", "guildBanRemove");
    const auditLogs = await ban.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanRemove,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    if (guildConfig.guild_logs_channel_id && logEntry?.executor?.id !== ban.client.user.id) {
      const channel = await ban.guild.channels.fetch(toStringId(guildConfig.guild_logs_channel_id)).catch(() => null);
      if (channel?.type === ChannelType.GuildText) {
        const webhook = await returnWebhook(ban.client, channel, ban.guild.id, {
          id: guildConfig.guild_logs_webhook_id,
          type: WebhookType.GUILD_LOGS,
        });
        const embed = new EmbedBuilder()
          .setTitle(t("embed.title"))
          .setColor("Green")
          .setThumbnail(ban.user.displayAvatarURL())
          .setDescription(t("embed.description", { user: ban.user }))
          .setFooter({
            text: logEntry?.executor?.tag || t("unknown_executor"),
            iconURL: logEntry?.executor?.displayAvatarURL() || undefined,
          })
          .setTimestamp()
          .addFields([
            {
              name: t("embed.fields.reason"),
              value: ban.reason || t("no_reason"),
            },
          ]);
        await webhook
          .send({
            embeds: [embed],
            allowedMentions: { parse: [] }, // Prevent mentions in the log
          })
          .catch((error) => {
            logger.log({
              level: "error",
              message: `Failed to send guildBanRemove embed in ${ban.guild.name} (${ban.guild.id})`,
              error,
              channelId: channel.id,
            });
          });
      }
      await modLog(
        {
          guild: ban.guild,
          user: ban.user,
          moderator: logEntry?.executor ?? null,
          action: "UNBAN",
          reason: ban.reason || t("no_reason"),
        },
        ban.client,
      );
    }
  },
} satisfies EventBase<Events.GuildBanRemove>;
