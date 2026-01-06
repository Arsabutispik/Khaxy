// Helper to fetch audit logs (only when not manual)
import { LogActionOptions, LogMemberUpdateOptions, sendLogEmbed, modLog, returnWebhook, WebhookType } from "@utils";
import {
  AuditLogEvent,
  ChannelType,
  EmbedBuilder,
  Guild,
  GuildMember,
  PartialUser,
  time,
  TimestampStyles,
  User,
} from "discord.js";
import { TFunction } from "i18next";

async function fetchAuditLog<T extends AuditLogEvent>(guild: Guild, type: T) {
  const auditLogs = await guild.fetchAuditLogs({ limit: 1, type }).catch(() => null);
  return auditLogs?.entries.first();
}

// Get executor info from audit log (for automatic event logging)
async function getExecutorInfo(
  guild: Guild,
  auditLogType: AuditLogEvent,
  targetId: string,
): Promise<{ executor: User | PartialUser | null; reason?: string | null } | null> {
  const logEntry = await fetchAuditLog(guild, auditLogType);
  const botId = guild.client.user.id;

  // Validate the log entry exists, matches the target, and wasn't the bot
  if (
    !logEntry ||
    !logEntry.target ||
    !("id" in logEntry.target) ||
    logEntry.target.id !== targetId ||
    logEntry.executor?.id === botId
  ) {
    return null;
  }

  return { executor: logEntry.executor ?? null, reason: logEntry.reason };
}

// Embed builders (unchanged)
function buildTimeoutEmbed(
  member: GuildMember,
  timeoutUntil: Date,
  executorInfo: { reason?: string | null; executor?: User | PartialUser | null },
  t: TFunction,
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(t("timeout.embed.title"))
    .setColor("Yellow")
    .setDescription(
      t("timeout.embed.description", {
        user: member.user,
        timestamp: time(timeoutUntil, TimestampStyles.FullDateShortTime),
      }),
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .addFields([{ name: t("timeout.embed.fields.reason"), value: executorInfo.reason || t("timeout.no_reason") }])
    .setFooter({
      text: executorInfo.executor?.tag || t("unknown_executor"),
      iconURL: executorInfo.executor?.displayAvatarURL() || undefined,
    });
}

function buildRemoveTimeoutEmbed(
  member: GuildMember,
  executorInfo: { executor?: User | PartialUser | null },
  t: TFunction,
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(t("remove_timeout.embed.title"))
    .setColor("Green")
    .setDescription(t("remove_timeout.embed.description", { user: member.user }))
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: executorInfo.executor?.tag || t("unknown_executor"),
      iconURL: executorInfo.executor?.displayAvatarURL() || undefined,
    });
}

function buildRolesUpdateEmbed(
  member: GuildMember,
  addedRoles: string[],
  removedRoles: string[],
  executorInfo: { executor?: User | PartialUser | null },
  t: TFunction,
): EmbedBuilder {
  let description = t("roles_update.embed.description", { user: member.user });
  if (addedRoles.length > 0) {
    description += `\n> **${t("roles_update.embed.added")}**: ${addedRoles.join(", ")}`;
  }
  if (removedRoles.length > 0) {
    description += `\n> **${t("roles_update.embed.removed")}**: ${removedRoles.join(", ")}`;
  }

  return new EmbedBuilder()
    .setTitle(t("roles_update.embed.title"))
    .setColor("Yellow")
    .setThumbnail(member.user.displayAvatarURL())
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      text: executorInfo.executor?.tag || t("unknown_executor"),
      iconURL: executorInfo.executor?.displayAvatarURL() || undefined,
    });
}

function buildNicknameChangeEmbed(
  member: GuildMember,
  oldNickname: string,
  newNickname: string,
  executorInfo: { executor?: User | PartialUser | null },
  t: TFunction,
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(t("nickname_change.embed.title"))
    .setColor("Blue")
    .setDescription(
      t("nickname_change.embed.description", {
        user: member.user,
        old_nickname: oldNickname || t("nickname_change.no_nickname"),
        new_nickname: newNickname || t("nickname_change.no_nickname"),
      }),
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: executorInfo.executor?.tag || t("unknown_executor"),
      iconURL: executorInfo.executor?.displayAvatarURL() || undefined,
    });
}

/**
 * Log a specific member action (for manual/bot-initiated actions)
 */
export async function logMemberAction({
  member,
  action,
  guildConfig,
  t,
  executor,
  reason,
  addedRoles = [],
  removedRoles = [],
  oldNickname,
  newNickname,
  timeoutUntil,
}: LogActionOptions) {
  const channelId = guildConfig.logConfig?.guildMemberLogsChannelId;
  if (!channelId) return;

  const logChannel = member.guild.channels.cache.get(channelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  const webhook = await returnWebhook(member.client, logChannel, member.guild.id, guildConfig, {
    id: guildConfig.logConfig?.guildMemberLogsWebhookId,
    type: WebhookType.GUILD_MEMBER_LOGS,
  });
  if (!webhook) return;

  const executorInfo = { executor: executor ?? null, reason };
  let embed: EmbedBuilder;

  switch (action) {
    case "timeout":
      embed = buildTimeoutEmbed(member, timeoutUntil!, executorInfo, t);
      await modLog(
        {
          action: "TIMEOUT",
          moderator: executor ?? null,
          guild: member.guild,
          user: member.user,
          reason: reason || t("timeout.no_reason"),
        },
        member.client,
      );
      break;
    case "removeTimeout":
      embed = buildRemoveTimeoutEmbed(member, executorInfo, t);
      break;
    case "rolesUpdate":
      embed = buildRolesUpdateEmbed(member, addedRoles, removedRoles, executorInfo, t);
      break;
    case "nicknameChange":
      embed = buildNicknameChangeEmbed(member, oldNickname!, newNickname!, executorInfo, t);
      break;
  }

  await sendLogEmbed(webhook, [embed], member.guild, logChannel.id);
}

/**
 * Handle guildMemberUpdate event - only logs external (non-bot) actions
 */
export async function logMemberUpdate({ oldMember, newMember, guildConfig, t }: LogMemberUpdateOptions) {
  const channelId = guildConfig.logConfig?.guildMemberLogsChannelId;
  if (!channelId) return;

  const logChannel = newMember.guild.channels.cache.get(channelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  const fetchedOldMember = oldMember.partial ? await oldMember.fetch() : oldMember;
  const embeds: EmbedBuilder[] = [];

  // Timeout added
  if (newMember.isCommunicationDisabled() && !fetchedOldMember.isCommunicationDisabled()) {
    const executorInfo = await getExecutorInfo(newMember.guild, AuditLogEvent.MemberUpdate, newMember.user.id);
    if (executorInfo) {
      embeds.push(buildTimeoutEmbed(newMember, newMember.communicationDisabledUntil!, executorInfo, t));
      await modLog(
        {
          action: "TIMEOUT",
          moderator: executorInfo.executor,
          guild: newMember.guild,
          user: newMember.user,
          reason: executorInfo.reason || t("timeout.no_reason"),
        },
        newMember.client,
      );
    }
  }

  // Timeout removed
  if (fetchedOldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {
    const executorInfo = await getExecutorInfo(newMember.guild, AuditLogEvent.MemberUpdate, newMember.user.id);
    if (executorInfo) {
      embeds.push(buildRemoveTimeoutEmbed(newMember, executorInfo, t));
    }
  }

  // Role changes
  const removedRoles = fetchedOldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));
  const addedRoles = newMember.roles.cache.filter((role) => !fetchedOldMember.roles.cache.has(role.id));

  if (removedRoles.size > 0 || addedRoles.size > 0) {
    const executorInfo = await getExecutorInfo(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.user.id);
    if (executorInfo) {
      embeds.push(
        buildRolesUpdateEmbed(
          newMember,
          addedRoles.map((r) => r.toString()),
          removedRoles.map((r) => r.toString()),
          executorInfo,
          t,
        ),
      );
    }
  }

  // Nickname change
  if (fetchedOldMember.nickname !== newMember.nickname) {
    const executorInfo = await getExecutorInfo(newMember.guild, AuditLogEvent.MemberUpdate, newMember.user.id);
    if (executorInfo) {
      embeds.push(
        buildNicknameChangeEmbed(
          newMember,
          fetchedOldMember.nickname || fetchedOldMember.displayName,
          newMember.nickname || newMember.displayName,
          executorInfo,
          t,
        ),
      );
    }
  }

  if (embeds.length === 0) return;

  const webhook = await returnWebhook(newMember.client, logChannel, newMember.guild.id, guildConfig, {
    id: guildConfig.logConfig?.guildMemberLogsWebhookId,
    type: WebhookType.GUILD_MEMBER_LOGS,
  });
  if (!webhook) return;

  await sendLogEmbed(webhook, embeds, newMember.guild, logChannel.id);
}