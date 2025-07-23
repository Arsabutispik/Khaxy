import type { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { logger } from "@lib";
import { toStringId, modlog, returnWebhook, WebhookType } from "@utils";
import { getGuildConfig } from "@database";

export default {
  name: Events.GuildBanRemove,
  async execute(ban) {
    // Fetch guild data from the database
    const guild_config = await getGuildConfig(ban.guild.id);

    // If no guild data is found, exit the function
    if (!guild_config) return;
    const t = ban.client.i18next.getFixedT(guild_config.language, "events", "guildBanRemove");
    const audit_logs = await ban.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanRemove,
      })
      .catch(() => null);
    const audit_log = audit_logs?.entries.first();
    if (guild_config.guild_logs_channel_id) {
      if (audit_log?.executor?.id !== ban.client.user.id) {
        const channel = await ban.guild.channels
          .fetch(toStringId(guild_config.guild_logs_channel_id))
          .catch(() => null);
        if (channel?.type === ChannelType.GuildText) {
          const webhook = await returnWebhook(ban.client, channel, ban.guild.id, {
            id: guild_config.guild_logs_webhook_id,
            type: WebhookType.GUILD_LOGS,
          });
          const embed = new EmbedBuilder()
            .setTitle(t("embed.title"))
            .setColor("Green")
            .setThumbnail(ban.user.displayAvatarURL())
            .setDescription(t("embed.description", { user: ban.user }))
            .setFooter({
              text: audit_log?.executor?.tag || t("unknown_executor"),
              iconURL: audit_log?.executor?.displayAvatarURL() || undefined,
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
                message: `Failed to send guild ban remove log`,
                error,
                meta: {
                  guildId: ban.guild.id,
                  userId: ban.user.id,
                },
              });
            });
        }
      }
    }

    await modlog(
      {
        guild: ban.guild,
        user: ban.user,
        moderator: audit_log?.executor ?? null,
        action: "UNBAN",
        reason: ban.reason || t("no_reason"),
      },
      ban.client,
    );
  },
} satisfies EventBase<Events.GuildBanRemove>;
