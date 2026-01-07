import { EmbedBuilder, GuildMember, User, PartialUser, time, TimestampStyles } from "discord.js";
import { TFunction } from "i18next";

interface ExecutorInfo {
  executor?: User | PartialUser | null;
  reason?: string | null;
}

export function buildTimeoutEmbed(member: GuildMember, timeoutUntil: Date, info: ExecutorInfo, t: TFunction) {
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
    .addFields([
      {
        name: t("timeout.embed.fields.reason"),
        value: info.reason || t("timeout.no_reason"),
      },
    ])
    .setFooter({
      text: info.executor?.tag || t("unknown_executor"),
      iconURL: info.executor?.displayAvatarURL() || undefined,
    });
}

export function buildRemoveTimeoutEmbed(member: GuildMember, info: ExecutorInfo, t: TFunction) {
  return new EmbedBuilder()
    .setTitle(t("remove_timeout.embed.title"))
    .setColor("Green")
    .setDescription(t("remove_timeout.embed.description", { user: member.user }))
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: info.executor?.tag || t("unknown_executor"),
      iconURL: info.executor?.displayAvatarURL() || undefined,
    });
}

export function buildRolesUpdateEmbed(
  member: GuildMember,
  addedRoles: string[],
  removedRoles: string[],
  info: ExecutorInfo,
  t: TFunction,
) {
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
      text: info.executor?.tag || t("unknown_executor"),
      iconURL: info.executor?.displayAvatarURL() || undefined,
    });
}

export function buildNicknameChangeEmbed(
  member: GuildMember,
  oldNickname: string,
  newNickname: string,
  info: ExecutorInfo,
  t: TFunction,
) {
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
      text: info.executor?.tag || t("unknown_executor"),
      iconURL: info.executor?.displayAvatarURL() || undefined,
    });
}
