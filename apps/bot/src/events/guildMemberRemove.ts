import type { EventBase } from "@types";
import { AuditLogEvent, ChannelType, Events, PermissionsBitField } from "discord.js";
import { modLog, replacePlaceholders, sleep, logMemberLeave } from "@utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { closeThread, getOrCreateGuild, getThreadsByUser } from "@repo/database";
export default {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member) {
    // Fetch guild data from the database
    const guildConfig = await getOrCreateGuild(member.guild.id);
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
    if (guildConfig.leaveMessage && guildConfig.leaveChannelId) {
      const goodbyeChannel = member.guild.channels.cache.get(guildConfig.leaveChannelId);
      if (
        goodbyeChannel?.type === ChannelType.GuildText &&
        goodbyeChannel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages)
      ) {
        await goodbyeChannel.send(replacePlaceholders(guildConfig.leaveMessage, replacements));
      }
    }
    const t = member.client.i18next.getFixedT(guildConfig.language, "events", "guildMemberRemove");

    await sleep(2000); // Wait 2 seconds to ensure audit logs are updated

    const auditLogs = await member.guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    const executor = logEntry && logEntry.target?.id === member.id ? logEntry.executor : null;
    const isAKick =
      dayjs().diff(logEntry?.createdAt, "seconds") < 3 &&
      logEntry?.executor?.id !== member.client.user.id &&
      !!executor;
    if (isAKick) {
      await modLog(
        {
          guild: member.guild,
          user: member.user,
          action: "KICK",
          moderator: executor,
          reason: logEntry?.reason || t("no_reason"),
        },
        member.client,
      );
    }

    await logMemberLeave({ member, reason: logEntry?.reason || t("no_reason"), executor, guildConfig, t, isAKick });

    const threadRows = await getThreadsByUser(member.guild.id, member.user.id);
    for (const thread of threadRows) {
      await closeThread(thread.channelId, member.client.user!.id);
      const channel = member.guild.channels.cache.get(thread.channelId);
      if (
        channel?.type === ChannelType.GuildText &&
        channel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages)
      ) {
        await channel.send(
          t("user_left", {
            guild: member.guild.name,
          }),
        );
      }
    }
  },
} satisfies EventBase<Events.GuildMemberRemove>;
