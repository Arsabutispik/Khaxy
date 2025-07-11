import type { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time } from "discord.js";
import { modlog, returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";
import { getGuildConfig } from "@database";

export default {
  name: Events.GuildBanAdd,
  async execute(ban) {
    // Get the guild data from the database
    const guild_config = await getGuildConfig(ban.guild.id);

    // If no guild data is found, exit the function
    if (!guild_config) return;
    const t = ban.client.i18next.getFixedT(guild_config.language, "events", "guildBanAdd");
    const audit_logs = await ban.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
      })
      .catch(() => null);
    const audit_log = audit_logs?.entries.first();
    if (audit_log?.executor?.id === ban.client.user.id) return; // Ignore if the bot itself is the executor
    if (
      guild_config.guild_logs_channel_id &&
      ban.guild.channels.cache.has(toStringId(guild_config.guild_logs_channel_id))
    ) {
      const channel = ban.guild.channels.cache.get(toStringId(guild_config.guild_logs_channel_id));
      if (channel?.type === ChannelType.GuildText) {
        const webhook = await returnWebhook(ban.client, channel, ban.guild.id, {
          id: guild_config.guild_logs_webhook_id,
          type: WebhookType.GUILD_LOGS,
        });
        const member = await ban.guild.members.fetch(ban.user.id).catch(() => null);
        const embed = new EmbedBuilder()
          .setTitle(t("embed.title"))
          .setColor("Red")
          .setDescription(
            t("embed.description", {
              user: ban.user,
              timestamp: member && member.joinedAt ? time(member.joinedAt, "R") : t("never_joined"),
            }),
          )
          .addFields([
            {
              name: t("embed.fields.reason"),
              value: ban.reason || t("no_reason"),
            },
          ])
          .setFooter({
            text: audit_log?.executor?.tag || t("unknown_executor"),
            iconURL: audit_log?.executor?.displayAvatarURL() || undefined,
          });
        await webhook
          .send({
            embeds: [embed],
            allowedMentions: { parse: [] }, // Prevent mentions in the log
          })
          .catch((error) => {
            logger.log({
              level: "error",
              message: "Error sending ban log",
              error: error,
              meta: {
                guildID: ban.guild.id,
                userID: ban.user.id,
              },
            });
          });
      }
    }
    if (guild_config.mod_log_channel_id && ban.guild.channels.cache.has(toStringId(guild_config.mod_log_channel_id))) {
      const mod_log_channel = ban.guild.channels.cache.get(toStringId(guild_config.mod_log_channel_id));
      if (mod_log_channel?.type === ChannelType.GuildText) {
        await modlog(
          {
            guild: ban.guild,
            action: "BAN",
            user: ban.user,
            reason: ban.reason || t("no_reason"),
            moderator: audit_log?.executor || null,
          },
          ban.client,
        );
      }
    }
  },
} satisfies EventBase<Events.GuildBanAdd>;
