import { EmbedBuilder, GuildMember, VoiceState, User, time, TimestampStyles } from "discord.js";
import { TFunction } from "i18next";

// --- Helper for common base ---
function createBaseEmbed(member: GuildMember | null, color: "Green" | "Red" | "Yellow") {
  return new EmbedBuilder()
    .setColor(color)
    .setThumbnail(member?.user.displayAvatarURL() ?? null)
    .setTimestamp();
}

export function buildVoiceJoinEmbed(newState: VoiceState, t: TFunction<"loggers", "voiceStateEvents">) {
  return createBaseEmbed(newState.member, "Green")
    .setTitle(t(($) => $.voiceStateUpdate.join.embed.title))
    .setDescription(
      t(($) => $.voiceStateUpdate.join.embed.description, {
        user: {
          tag: newState.member?.user.tag,
          id: newState.member?.user.id,
        },
        channel: {
          name: newState.channel?.name,
          id: newState.channel?.id,
        },
        timestamp: time(new Date(), TimestampStyles.FullDateShortTime),
      }),
    );
}

export function buildVoiceLeaveEmbed(
  oldState: VoiceState,
  executor: User | null,
  t: TFunction<"loggers", "voiceStateEvents">,
) {
  const embed = createBaseEmbed(oldState.member, "Red")
    .setTitle(
      executor ? t(($) => $.voiceStateUpdate.leave.embed.titleKicked) : t(($) => $.voiceStateUpdate.leave.embed.title),
    )
    .setDescription(
      t(($) => $.voiceStateUpdate.leave.embed.description, {
        user: {
          tag: oldState.member?.user.tag,
          id: oldState.member?.user.id,
        },
        channel: {
          name: oldState.channel?.name,
          id: oldState.channel?.id,
        },
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

export function buildVoiceMoveEmbed(
  oldState: VoiceState,
  newState: VoiceState,
  executor: User | null,
  t: TFunction<"loggers", "voiceStateEvents">,
) {
  const embed = createBaseEmbed(oldState.member, "Yellow")
    .setTitle(t(($) => $.voiceStateUpdate.move.embed.title))
    .setDescription(
      t(($) => $.voiceStateUpdate.move.embed.description, {
        user: {
          tag: oldState.member?.user.tag,
          id: oldState.member?.user.id,
        },
        oldChannel: {
          name: oldState.channel?.name,
          id: oldState.channel?.id,
        },
        newChannel: {
          name: newState.channel?.name,
          id: newState.channel?.id,
        },
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
