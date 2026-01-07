import { EmbedBuilder, GuildMember, VoiceState, User, time, TimestampStyles } from "discord.js";
import { TFunction } from "i18next";

// --- Helper for common base ---
function createBaseEmbed(member: GuildMember | null, color: "Green" | "Red" | "Yellow") {
  return new EmbedBuilder()
    .setColor(color)
    .setThumbnail(member?.user.displayAvatarURL() ?? null)
    .setTimestamp();
}

export function buildVoiceJoinEmbed(newState: VoiceState, t: TFunction) {
  return createBaseEmbed(newState.member, "Green")
    .setTitle(t("join.embed.title"))
    .setDescription(
      t("join.embed.description", {
        user: newState.member?.user,
        channel: newState.channel,
        timestamp: time(new Date(), TimestampStyles.FullDateShortTime),
      }),
    );
}

export function buildVoiceLeaveEmbed(oldState: VoiceState, executor: User | null, t: TFunction) {
  const embed = createBaseEmbed(oldState.member, "Red")
    .setTitle(executor ? t("leave.embed.title_kicked") : t("leave.embed.title"))
    .setDescription(
      t("leave.embed.description", {
        user: oldState.member?.user,
        channel: oldState.channel,
        timestamp: time(new Date(), TimestampStyles.FullDateShortTime),
      }),
    );

  if (executor) {
    embed.setFooter({
      text: executor.tag,
      iconURL: executor.displayAvatarURL(),
    });
  }

  return embed;
}

export function buildVoiceMoveEmbed(oldState: VoiceState, newState: VoiceState, executor: User | null, t: TFunction) {
  const embed = createBaseEmbed(oldState.member, "Yellow")
    .setTitle(t("move.embed.title"))
    .setDescription(
      t("move.embed.description", {
        user: oldState.member?.user,
        oldChannel: oldState.channel,
        newChannel: newState.channel,
        timestamp: time(new Date(), TimestampStyles.FullDateShortTime),
      }),
    );

  if (executor) {
    embed.setFooter({
      text: executor.tag,
      iconURL: executor.displayAvatarURL(),
    });
  }

  return embed;
}
