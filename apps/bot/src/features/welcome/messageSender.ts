import { ChannelType, GuildMember, PartialGuildMember, PermissionsBitField } from "discord.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { replacePlaceholders } from "@utils";
import { GuildWithLogs } from "@repo/database";
import { logger } from "@lib";

dayjs.extend(relativeTime);

/**
 * Sends the welcome message. Returns TRUE if sent, FALSE if config/perms missing.
 */
export async function sendWelcomeMessage(
  member: GuildMember,
  guildConfig: GuildWithLogs,
  test: boolean = false,
): Promise<boolean> {
  // 1. Validate Config
  if (!guildConfig.joinMessage || !guildConfig.joinChannelId) return false;

  const welcomeChannel = member.guild.channels.cache.get(guildConfig.joinChannelId);

  // 2. Validate Channel & Permissions
  if (
    !welcomeChannel ||
    welcomeChannel.type !== ChannelType.GuildText ||
    !welcomeChannel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages)
  ) {
    return false;
  }

  // 3. Prepare Replacements
  const replacements = {
    user: member.toString(),
    server: member.guild.name,
    memberCount: member.guild.memberCount.toString(),
    name: member.user.username,
    joinPosition: member.guild.memberCount.toString(),
    createdAt: dayjs(member.user.createdAt).format("DD/MM/YYYY"),
    createdAgo: dayjs(member.user.createdAt).fromNow(),
  };

  // 4. Send
  try {
    const content = replacePlaceholders(guildConfig.joinMessage, replacements);
    await welcomeChannel.send({
      content,
      allowedMentions: test ? { parse: [] } : undefined,
    });
    return true;
  } catch (e) {
    console.error("Failed to send welcome message", e);
    return false;
  }
}

/**
 * Sends the leave message. Returns TRUE if sent, FALSE if config/perms missing.
 */
export async function sendLeaveMessage(
  member: GuildMember | PartialGuildMember,
  guildConfig: GuildWithLogs,
  test: boolean = false,
): Promise<boolean> {
  // 1. Validate Config
  if (!guildConfig.leaveMessage || !guildConfig.leaveChannelId) return false;

  const leaveChannel = member.guild.channels.cache.get(guildConfig.leaveChannelId);

  // 2. Validate Channel & Permissions
  if (
    !leaveChannel ||
    leaveChannel.type !== ChannelType.GuildText ||
    !leaveChannel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages)
  ) {
    return false;
  }

  // 3. Prepare Replacements
  const replacements = {
    user: member.toString(),
    server: member.guild.name,
    memberCount: member.guild.memberCount.toString(),
    name: member.user.username,
    joinPosition: member.guild.memberCount.toString(),
    createdAt: dayjs(member.user.createdAt).format("DD/MM/YYYY"),
    createdAgo: dayjs(member.user.createdAt).fromNow(),
  };

  // 4. Send
  try {
    const content = replacePlaceholders(guildConfig.leaveMessage, replacements);
    await leaveChannel.send({
      content,
      allowedMentions: test ? { parse: [] } : undefined,
    });
    return true;
  } catch (e) {
    console.error("Failed to send leave message", e);
    return false;
  }
}

export async function sendRegisterMessage(member: GuildMember, guildConfig: GuildWithLogs, test: boolean = false) {
  if (guildConfig.registerJoinChannelId && guildConfig.registerJoinMessage) {
    const registerWelcomeChannel = member.guild.channels.cache.get(guildConfig.registerJoinChannelId);
    if (
      registerWelcomeChannel?.type === ChannelType.GuildText &&
      registerWelcomeChannel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages)
    ) {
      const replacements = {
        user: member.toString(),
        server: member.guild.name,
        memberCount: member.guild.memberCount.toString(),
        name: member.user.username,
        joinPosition: member.guild.memberCount.toString(),
        createdAt: dayjs(member.user.createdAt).format("DD/MM/YYYY"),
        createdAgo: dayjs(member.user.createdAt).fromNow(),
      };
      try {
        await registerWelcomeChannel.send({
          content: replacePlaceholders(guildConfig.registerJoinMessage, replacements),
          allowedMentions: test ? { parse: [] } : undefined,
        });
        // If the guild set up an unverified role, assign it to the member
        if (guildConfig.unverifiedRoleId && !test) {
          await member.roles.add(guildConfig.unverifiedRoleId).catch((error) => {
            logger.log({
              level: "error",
              error,
              message: "Error assigning unverified role",
              meta: {
                guildID: member.guild.id,
                userID: member.id,
              },
            });
          });
        }
        return true;
      } catch (error) {
        logger.error(`Failed to send register welcome message in ${member.guild.name} (${member.guild.id})`, {
          error,
        });
        return false;
      }
    }
  }
}
