// features/welcome/welcomeSender.ts
import { GuildMember, ChannelType, PermissionsBitField } from "discord.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { replacePlaceholders } from "@utils"; // Import your regex helper here
import { GuildWithLogs } from "@repo/database";

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
