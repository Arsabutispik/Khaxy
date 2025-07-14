import type { EventBase } from "@customTypes";
import {
  AuditLogEvent,
  ChannelType,
  EmbedBuilder,
  Events,
  PermissionsBitField,
  time,
  TimestampStyles,
} from "discord.js";
import { replacePlaceholders, toStringId, modlog, returnWebhook, WebhookType } from "@utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { ModMailThreadStatus } from "@constants";
import { getGuildConfig, getModMailThreadsByUser, updateModMailThread } from "@database";
import { logger } from "@lib";

export default {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member) {
    // Fetch guild data from the database
    const guild_config = await getGuildConfig(member.guild.id);
    dayjs.extend(relativeTime);
    const replacements = {
      user: member.toString(),
      server: member.guild.name,
      memberCount: member.guild.memberCount.toString(),
      "nam}": member.user.username,
      joinPosition: (member.guild.memberCount - 1).toString(),
      createdAt: dayjs(member.user.createdAt).format("DD/MM/YYYY"),
      createdAgo: dayjs(member.user.createdAt).fromNow(),
    };
    // If no guild data is found, exit the function
    if (!guild_config) return;

    // If a goodbye message and channel are configured, send the goodbye message to the channel
    if (
      guild_config.leave_message &&
      guild_config.leave_channel_id &&
      member.guild.channels.cache.has(toStringId(guild_config.leave_channel_id))
    ) {
      const goodbye_channel = member.guild.channels.cache.get(toStringId(guild_config.leave_channel_id))!;
      if (goodbye_channel.type === ChannelType.GuildText) {
        if (goodbye_channel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages))
          await goodbye_channel.send(replacePlaceholders(guild_config.leave_message, replacements));
      }
    }
    const t = member.client.i18next.getFixedT(guild_config.language, "events", "guildMemberRemove");
    const audit_logs = await member.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
      })
      .catch(() => null);
    const audit_log = audit_logs?.entries.first();
    if (
      dayjs().diff(audit_log?.createdAt, "seconds") < 3 &&
      audit_log?.executor?.id !== member.client.user.id &&
      audit_log?.target?.id === member.user.id
    ) {
      await modlog(
        {
          guild: member.guild,
          user: member.user,
          action: "KICK",
          moderator: audit_log.executor!,
          reason: audit_log.reason || t("no_reason"),
        },
        member.client,
      );
    }
    if (
      guild_config.guild_logs_channel_id &&
      member.guild.channels.cache.has(toStringId(guild_config.guild_logs_channel_id))
    ) {
      const channel = member.guild.channels.cache.get(toStringId(guild_config.guild_logs_channel_id));
      if (channel?.type === ChannelType.GuildText) {
        const webhook = await returnWebhook(member.client, channel, member.guild.id, {
          id: guild_config.guild_logs_webhook_id,
          type: WebhookType.GUILD_LOGS,
        });
        const embed = new EmbedBuilder()
          .setTitle(t("embed.title"))
          .setColor("Red")
          .setThumbnail(member.user.displayAvatarURL())
          .setDescription(
            t("embed.description", {
              user: member.user,
              member_count: member.guild.memberCount.toString(),
              timestamp: member.joinedAt ? time(member.joinedAt, TimestampStyles.RelativeTime) : t("never_joined"),
            }),
          )
          .setTimestamp();
        if (
          dayjs().diff(audit_log?.createdAt, "seconds") < 3 &&
          audit_log?.executor?.id !== member.client.user.id &&
          audit_log?.target?.id === member.user.id
        ) {
          embed.setFooter({
            text: audit_log.executor?.tag || t("unknown_executor"),
            iconURL: audit_log.executor?.displayAvatarURL(),
          });
          embed.addFields([
            {
              name: t("embed.fields.reason"),
              value: audit_log?.reason || t("no_reason"),
            },
          ]);
        }
        await webhook
          .send({
            embeds: [embed],
            allowedMentions: { parse: [] }, // Prevent mentions in the log
          })
          .catch((error) => {
            logger.log({
              level: "error",
              message: "Error sending guild member remove log",
              error,
              meta: {
                guildId: member.guild.id,
                userId: member.user.id,
              },
            });
          });
      }
    }
    const thread_rows = await getModMailThreadsByUser(member.user.id);
    for (const thread of thread_rows) {
      await updateModMailThread(thread.channel_id, {
        status: ModMailThreadStatus.CLOSED,
      });
      const channel = member.guild.channels.cache.get(toStringId(thread.channel_id));
      if (channel?.isTextBased()) {
        await channel.send(
          t("user_left", {
            guild: member.guild.name,
          }),
        );
      }
    }
  },
} satisfies EventBase<Events.GuildMemberRemove>;
