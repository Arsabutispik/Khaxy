import { EmbedBuilder, GuildMember, User, PartialUser, time, TimestampStyles } from "discord.js";
import { TFunction } from "i18next";

interface ExecutorInfo {
  executor?: User | PartialUser | null;
  reason?: string | null;
}

export function buildTimeoutEmbed(
  member: GuildMember,
  timeoutUntil: Date,
  info: ExecutorInfo,
  t: TFunction<"loggers", "memberEvents">,
) {
  return new EmbedBuilder()
    .setTitle(t(($) => $.memberUpdate.timeout.embed.title))
    .setColor("Yellow")
    .setDescription(
      t(($) => $.memberUpdate.timeout.embed.description, {
        user: member.user,
        timestamp: time(timeoutUntil, TimestampStyles.FullDateShortTime),
      }),
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .addFields([
      {
        name: t(($) => $.memberUpdate.timeout.embed.fields.reason),
        value: info.reason || t(($) => $.memberUpdate.timeout.noReason),
      },
    ])
    .setFooter({
      text: info.executor?.tag || t(($) => $.unknownExecutor),
      iconURL: info.executor?.displayAvatarURL() || undefined,
    });
}

export function buildRemoveTimeoutEmbed(
  member: GuildMember,
  info: ExecutorInfo,
  t: TFunction<"loggers", "memberEvents">,
) {
  return new EmbedBuilder()
    .setTitle(t(($) => $.memberUpdate.removeTimeout.embed.title))
    .setColor("Green")
    .setDescription(t(($) => $.memberUpdate.removeTimeout.embed.description, { user: member.user }))
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: info.executor?.tag || t(($) => $.unknownExecutor),
      iconURL: info.executor?.displayAvatarURL() || undefined,
    });
}

export function buildRolesUpdateEmbed(
  member: GuildMember,
  addedRoles: string[],
  removedRoles: string[],
  info: ExecutorInfo,
  t: TFunction<"loggers", "memberEvents">,
) {
  let description = t(($) => $.memberUpdate.rolesUpdate.embed.description, { user: member.user });

  if (addedRoles.length > 0) {
    description += `\n> **${t(($) => $.memberUpdate.rolesUpdate.embed.added)}**: ${addedRoles.join(", ")}`;
  }
  if (removedRoles.length > 0) {
    description += `\n> **${t(($) => $.memberUpdate.rolesUpdate.embed.removed)}**: ${removedRoles.join(", ")}`;
  }

  return new EmbedBuilder()
    .setTitle(t(($) => $.memberUpdate.rolesUpdate.embed.title))
    .setColor("Yellow")
    .setThumbnail(member.user.displayAvatarURL())
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      text: info.executor?.tag || t(($) => $.unknownExecutor),
      iconURL: info.executor?.displayAvatarURL() || undefined,
    });
}

export function buildNicknameChangeEmbed(
  member: GuildMember,
  oldNickname: string,
  newNickname: string,
  info: ExecutorInfo,
  t: TFunction<"loggers", "memberEvents">,
) {
  return new EmbedBuilder()
    .setTitle(t(($) => $.memberUpdate.nicknameChange.embed.title))
    .setColor("Blue")
    .setDescription(
      t(($) => $.memberUpdate.nicknameChange.embed.description, {
        user: member.user,
        old_nickname: oldNickname || t(($) => $.memberUpdate.nicknameChange.noNickname),
        new_nickname: newNickname || t(($) => $.memberUpdate.nicknameChange.noNickname),
      }),
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: info.executor?.tag || t(($) => $.unknownExecutor),
      iconURL: info.executor?.displayAvatarURL() || undefined,
    });
}
