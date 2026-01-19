import { AuditLogEvent, ChannelType, EmbedBuilder, Guild, PartialUser, User } from "discord.js";
import { LogActionOptions, LogMemberUpdateOptions, sendLogEmbed, modLog, returnWebhook, WebhookType } from "@utils";
import * as Embeds from "./memberEmbeds.js";
import { logUnhandledChanges } from "../utils.js";

// --- Helper: Fetch Audit Log ---
async function getExecutorInfo(
  guild: Guild,
  type: AuditLogEvent,
  targetId: string,
): Promise<{ executor: User | PartialUser | null; reason?: string | null } | null> {
  const auditLogs = await guild.fetchAuditLogs({ limit: 1, type }).catch(() => null);
  const logEntry = auditLogs?.entries.first();
  const botId = guild.client.user.id;

  // 1. Check if entry exists
  if (!logEntry || !logEntry.target) return null;

  // 2. Check if the target actually HAS an ID property (Filters out Invites)
  if (!("id" in logEntry.target)) return null;

  // 3. Compare IDs safely (Now TS knows 'id' exists)
  if (logEntry.target.id !== targetId) return null;

  // 4. Ignore actions done by the Bot itself
  if (logEntry.executor?.id === botId) return null;

  return { executor: logEntry.executor ?? null, reason: logEntry.reason };
}

// --- MAIN 1: Handle Manual/Command Actions ---
export async function logMemberAction({
  member,
  action,
  guildConfig,
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

  const info = { executor: executor ?? null, reason };
  let embed: EmbedBuilder | null = null;
  const t = logChannel.client.i18next.getFixedT(guildConfig.language, "loggers", "memberEvents");
  switch (action) {
    case "timeout":
      embed = Embeds.buildTimeoutEmbed(member, timeoutUntil!, info, t);
      await modLog(
        {
          action: "TIMEOUT",
          moderator: executor ?? null,
          guild: member.guild,
          user: member.user,
          reason: reason || t(($) => $.memberUpdate.timeout.noReason),
        },
        member.client,
      );
      break;
    case "removeTimeout":
      embed = Embeds.buildRemoveTimeoutEmbed(member, info, t);
      break;
    case "rolesUpdate":
      embed = Embeds.buildRolesUpdateEmbed(member, addedRoles, removedRoles, info, t);
      break;
    case "nicknameChange":
      embed = Embeds.buildNicknameChangeEmbed(member, oldNickname!, newNickname!, info, t);
      break;
  }

  if (embed) {
    await sendLogEmbed(webhook, [embed], member.guild, logChannel.id);
  }
}

// --- MAIN 2: Handle Automatic Event Updates ---
export async function logMemberUpdate({ oldMember, newMember, guildConfig }: LogMemberUpdateOptions) {
  const channelId = guildConfig.logConfig?.guildMemberLogsChannelId;
  if (!channelId) return;

  const logChannel = newMember.guild.channels.cache.get(channelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  const fetchedOldMember = oldMember.partial ? await oldMember.fetch() : oldMember;
  const embeds: EmbedBuilder[] = [];
  const t = logChannel.client.i18next.getFixedT(guildConfig.language, "loggers", "memberEvents");
  // A. TIMEOUT ADDED
  if (newMember.isCommunicationDisabled() && !fetchedOldMember.isCommunicationDisabled()) {
    const info = await getExecutorInfo(newMember.guild, AuditLogEvent.MemberUpdate, newMember.user.id);
    if (info) {
      embeds.push(Embeds.buildTimeoutEmbed(newMember, newMember.communicationDisabledUntil!, info, t));
      await modLog(
        {
          action: "TIMEOUT",
          moderator: info.executor,
          guild: newMember.guild,
          user: newMember.user,
          reason: info.reason || t(($) => $.memberUpdate.timeout.noReason),
        },
        newMember.client,
      );
    }
  }

  // B. TIMEOUT REMOVED
  if (fetchedOldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {
    const info = await getExecutorInfo(newMember.guild, AuditLogEvent.MemberUpdate, newMember.user.id);
    if (info) {
      embeds.push(Embeds.buildRemoveTimeoutEmbed(newMember, info, t));
    }
  }

  // C. ROLES CHANGED
  const removedRoles = fetchedOldMember.roles.cache.filter((r) => !newMember.roles.cache.has(r.id));
  const addedRoles = newMember.roles.cache.filter((r) => !fetchedOldMember.roles.cache.has(r.id));

  if (removedRoles.size > 0 || addedRoles.size > 0) {
    const info = await getExecutorInfo(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.user.id);
    if (info) {
      embeds.push(
        Embeds.buildRolesUpdateEmbed(
          newMember,
          addedRoles.map((r) => r.toString()),
          removedRoles.map((r) => r.toString()),
          info,
          t,
        ),
      );
    }
  }

  // D. NICKNAME CHANGED
  if (fetchedOldMember.nickname !== newMember.nickname) {
    const info = await getExecutorInfo(newMember.guild, AuditLogEvent.MemberUpdate, newMember.user.id);
    if (info) {
      embeds.push(
        Embeds.buildNicknameChangeEmbed(
          newMember,
          fetchedOldMember.nickname || fetchedOldMember.displayName,
          newMember.nickname || newMember.displayName,
          info,
          t,
        ),
      );
    }
  }
  if (embeds.length === 0) {
    logUnhandledChanges("MemberUpdate", oldMember, newMember, `@${newMember.user.tag} in ${newMember.guild.name}`, [
      // Managers specific to Member
      "user",
      "voice",
      "presence",
      "flags",
      "permissions",
      "joinedAt",
      "joinedTimestamp",
      "premiumSince",
      "premiumSinceTimestamp",
    ]);
    return;
  }
  // SEND BATCH
  if (embeds.length > 0) {
    const webhook = await returnWebhook(newMember.client, logChannel, newMember.guild.id, guildConfig, {
      id: guildConfig.logConfig?.guildMemberLogsWebhookId,
      type: WebhookType.GUILD_MEMBER_LOGS,
    });

    if (webhook) {
      await sendLogEmbed(webhook, embeds, newMember.guild, logChannel.id);
    }
  }
}
