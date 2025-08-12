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
import { replacePlaceholders, toStringId, modLog, returnWebhook, WebhookType } from "@utils";
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
    const guildConfig = await getGuildConfig(member.guild.id);
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
    if (!guildConfig) return;

    // If a goodbye message and channel are configured, send the goodbye message to the channel
    if (guildConfig.leave_message && guildConfig.leave_channel_id) {
      const goodbyeChannel = await member.guild.channels
        .fetch(toStringId(guildConfig.leave_channel_id))
        .catch(() => null);
      if (goodbyeChannel?.type === ChannelType.GuildText) {
        if (goodbyeChannel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages))
          await goodbyeChannel.send(replacePlaceholders(guildConfig.leave_message, replacements));
      }
    }
    const t = member.client.i18next.getFixedT(guildConfig.language, "events", "guildMemberRemove");
    const auditLogs = await member.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    if (
      dayjs().diff(logEntry?.createdAt, "seconds") < 3 &&
      logEntry?.executor?.id !== member.client.user.id &&
      logEntry?.target?.id === member.user.id
    ) {
      await modLog(
        {
          guild: member.guild,
          user: member.user,
          action: "KICK",
          moderator: logEntry.executor!,
          reason: logEntry.reason || t("no_reason"),
        },
        member.client,
      );
    }
    if (guildConfig.guild_logs_channel_id) {
      const logChannel = await member.guild.channels
        .fetch(toStringId(guildConfig.guild_logs_channel_id))
        .catch(() => null);
      if (logChannel?.type === ChannelType.GuildText) {
        const webhook = await returnWebhook(member.client, logChannel, member.guild.id, {
          id: guildConfig.guild_logs_webhook_id,
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
          dayjs().diff(logEntry?.createdAt, "seconds") < 3 &&
          logEntry?.executor?.id !== member.client.user.id &&
          logEntry?.target?.id === member.user.id
        ) {
          embed.setTitle(t("embed.title_kicked"));
          embed.setFooter({
            text: logEntry.executor?.tag || t("unknown_executor"),
            iconURL: logEntry.executor?.displayAvatarURL(),
          });
          embed.addFields([
            {
              name: t("embed.fields.reason"),
              value: logEntry?.reason || t("no_reason"),
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
              message: `Failed to send guildMemberUpdate embed in ${member.guild.name} (${member.guild.id})`,
              error,
              channelId: logChannel.id,
            });
          });
      }
    }
    const threadRows = await getModMailThreadsByUser(member.user.id);
    for (const thread of threadRows) {
      await updateModMailThread(thread.channel_id, {
        status: ModMailThreadStatus.CLOSED,
      });
      const channel = await member.guild.channels.fetch(toStringId(thread.channel_id)).catch(() => null);
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
