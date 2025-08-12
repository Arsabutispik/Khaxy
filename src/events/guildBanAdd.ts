import type { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, time } from "discord.js";
import { addInfraction, modLog, returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";
import { getGuildConfig } from "@database";
import { InfractionType } from "@constants";

export default {
  name: Events.GuildBanAdd,
  async execute(ban) {
    // Get the guild data from the database
    const guild_config = await getGuildConfig(ban.guild.id);

    // If no guild data is found, exit the function
    if (!guild_config) return;
    const t = ban.client.i18next.getFixedT(guild_config.language, "events", "guildBanAdd");
    const auditLogs = await ban.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
      })
      .catch(() => null);
    const auditLog = auditLogs?.entries.first();
    if (guild_config.guild_logs_channel_id) {
      if (auditLog?.executor?.id !== ban.client.user.id) {
        const channel = await ban.guild.channels
          .fetch(toStringId(guild_config.guild_logs_channel_id))
          .catch(() => null);
        if (channel?.type === ChannelType.GuildText) {
          const webhook = await returnWebhook(ban.client, channel, ban.guild.id, {
            id: guild_config.guild_logs_webhook_id,
            type: WebhookType.GUILD_LOGS,
          });
          const member = await ban.guild.members.fetch(ban.user.id).catch(() => null);
          const embed = new EmbedBuilder()
            .setTitle(t("embed.title"))
            .setColor("Red")
            .setThumbnail(ban.user.displayAvatarURL())
            .setTimestamp()
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
              text: auditLog?.executor?.tag || t("unknown_executor"),
              iconURL: auditLog?.executor?.displayAvatarURL() || undefined,
            });
          await webhook
            .send({
              embeds: [embed],
              allowedMentions: { parse: [] }, // Prevent mentions in the log
            })
            .catch((error) => {
              logger.log({
                level: "error",
                message: `Failed to send guildBanAdd embed in ${ban.guild.name} (${ban.guild.id})`,
                error: error,
                channelId: channel.id,
              });
            });
        }
      }
    }
    if (auditLog?.executor?.id !== ban.client.user.id) {
      await modLog(
        {
          guild: ban.guild,
          action: "BAN",
          user: ban.user,
          reason: ban.reason || t("no_reason"),
          moderator: auditLog?.executor ?? null,
        },
        ban.client,
      );
      await addInfraction({
        guild: ban.guild,
        member: ban.user.id,
        type: InfractionType.BAN,
        reason: ban.reason || t("no_reason"),
        moderator: auditLog?.executor?.id || ban.client.user.id,
      });
    }
  },
} satisfies EventBase<Events.GuildBanAdd>;
