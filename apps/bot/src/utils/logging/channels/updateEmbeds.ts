import {
  ChannelType,
  EmbedBuilder,
  ForumChannel,
  ForumLayoutType,
  GuildForumTagEmoji,
  NonThreadGuildBasedChannel,
  SortOrderType,
  TextChannel,
  ThreadAutoArchiveDuration,
  User,
  VideoQualityMode,
  VoiceChannel,
} from "discord.js";
import { formatDuration, formatUpdatedTagEmoji, diffGuildForumTags, diffPermissions } from "@utils";
import { TFunction } from "i18next";

function createBaseEmbed(
  channel: NonThreadGuildBasedChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor("Yellow")
    .setThumbnail(channel.guild.iconURL() ?? null)
    .setTimestamp()
    .setFooter({
      text: executor?.tag ?? t(($) => $.unknownExecutor),
      iconURL: executor?.displayAvatarURL() ?? undefined,
    });
}

export function buildNameChangeEmbed(
  oldName: string,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.nameChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.nameChange.embed.description, {
        channel: newChannel,
        old_name: oldName,
        new_name: newChannel.name,
      }),
    );
}

export function buildTopicChangeEmbed(
  oldTopic: string | null,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.topicChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.topicChange.embed.description, {
        channel: newChannel,
        old_topic: oldTopic || t(($) => $.channelUpdate.topicChange.noTopic),
        new_topic: (newChannel as TextChannel).topic || t(($) => $.channelUpdate.topicChange.noTopic),
      }),
    );
}

export function buildNsfwChangeEmbed(
  oldNsfw: boolean,
  newChannel: NonThreadGuildBasedChannel & { nsfw: boolean },
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  const getEmoji = (state: boolean) =>
    state
      ? newChannel.client.allEmojis.get(newChannel.client.config.emojis.confirm.id)?.format
      : newChannel.client.allEmojis.get(newChannel.client.config.emojis.reject.id)?.format;

  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.nsfwChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.nsfwChange.embed.description, {
        channel: newChannel,
        old_nsfw: getEmoji(oldNsfw),
        new_nsfw: getEmoji(newChannel.nsfw),
      }),
    );
}

export function buildTypeChangeEmbed(
  oldType: ChannelType,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.typeChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.typeChange.embed.description, {
        channel: newChannel,
        old_type: t(($) => $.channelTypes[oldType]),
        new_type: t(($) => $.channelTypes[newChannel.type]),
      }),
    );
}

export function buildPermissionsChangeEmbed(
  oldChannel: NonThreadGuildBasedChannel,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  language: string,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.permissionsChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.permissionsChange.embed.description, {
        channel: newChannel,
        changes:
          diffPermissions(newChannel.client, oldChannel, newChannel, language) ||
          t(($) => $.channelUpdate.permissionsChange.noChanges),
      }),
    );
}

export function buildRateLimitChangeEmbed(
  oldRateLimit: number | null,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  language: string,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  const newLimit = (newChannel as TextChannel).rateLimitPerUser ?? 0;
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.rateLimitChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.rateLimitChange.embed.description, {
        channel: newChannel,
        old_rate_limit: formatDuration((oldRateLimit || 0) * 1000, language),
        new_rate_limit: formatDuration(newLimit * 1000, language),
      }),
    );
}

// ============================================================================
// EMBED BUILDERS: VOICE
// ============================================================================

export function buildBitrateChangeEmbed(
  oldBitrate: number,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  const newBitrate = (newChannel as VoiceChannel).bitrate;
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.bitrateChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.bitrateChange.embed.description, {
        channel: newChannel,
        old_bitrate: `${oldBitrate.toString().slice(0, 2)}kbps`,
        new_bitrate: `${newBitrate.toString().slice(0, 2)}kbps`,
      }),
    );
}

export function buildUserLimitChangeEmbed(
  oldLimit: number,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  const newLimit = (newChannel as VoiceChannel).userLimit;
  const infinityEmoji = newChannel.client.allEmojis.get(newChannel.client.config.emojis.infinity.id)?.format;

  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.userLimitChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.userLimitChange.embed.description, {
        channel: newChannel,
        old_user_limit: oldLimit > 0 ? oldLimit : infinityEmoji,
        new_user_limit: newLimit > 0 ? newLimit : infinityEmoji,
      }),
    );
}

export function buildRtcRegionChangeEmbed(
  oldRegion: string | null,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.rtcRegionChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.rtcRegionChange.embed.description, {
        channel: newChannel,
        old_rtc_region: oldRegion || "N/A",
        new_rtc_region: (newChannel as VoiceChannel).rtcRegion || "N/A",
      }),
    );
}

export function buildVideoQualityChangeEmbed(
  oldMode: VideoQualityMode | null,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  const newMode = (newChannel as VoiceChannel).videoQualityMode || VideoQualityMode.Auto;
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.videoQualityModeChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.videoQualityModeChange.embed.description, {
        channel: newChannel,
        old_video_quality_mode: t(($) => $.channelUpdate.videoQualityModeChange.modes[oldMode ?? "1"]),
        new_video_quality_mode: t(($) => $.channelUpdate.videoQualityModeChange.modes[newMode]),
      }),
    );
}

// ============================================================================
// EMBED BUILDERS: FORUM
// ============================================================================

export function buildForumArchiveDurationEmbed(
  oldDuration: ThreadAutoArchiveDuration | null,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  const newDuration = newChannel.defaultAutoArchiveDuration;
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.defaultArchiveDurationChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.defaultArchiveDurationChange.embed.description, {
        channel: newChannel,
        old_archive_duration:
          oldDuration !== null ? t(($) => $.channelUpdate.defaultArchiveDurationChange.time[oldDuration]) : "N/A",
        new_archive_duration:
          newDuration !== null ? t(($) => $.channelUpdate.defaultArchiveDurationChange.time[newDuration]) : "N/A",
      }),
    );
}

export function buildForumRateLimitEmbed(
  oldRateLimit: number | null,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.forumRateLimitChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.forumRateLimitChange.embed.description, {
        channel: newChannel,
        old_rate_limit: `${oldRateLimit}s`,
        new_rate_limit: `${newChannel.rateLimitPerUser}s`,
      }),
    );
}

export function buildForumThreadRateLimitEmbed(
  oldRateLimit: number | null,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.forumDefaultThreadRateLimitChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.forumDefaultThreadRateLimitChange.embed.description, {
        channel: newChannel,
        old_rate_limit: `${oldRateLimit}s`,
        new_rate_limit: `${newChannel.defaultThreadRateLimitPerUser}s`,
      }),
    );
}

export function buildForumReactionEmojiEmbed(
  oldEmojiId: string | undefined | null,
  oldEmojiName: string | undefined | null,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  const oldReactionEmoji = newChannel.guild.emojis.cache.get(oldEmojiId || "0");
  const newReactionEmoji = newChannel.guild.emojis.cache.get(newChannel.defaultReactionEmoji?.id || "0");

  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.forumDefaultReactionEmojiChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.forumDefaultReactionEmojiChange.embed.description, {
        channel: newChannel,
        old_reaction_emoji: oldReactionEmoji ? oldReactionEmoji.toString() : oldEmojiName || "N/A",
        new_reaction_emoji: newReactionEmoji
          ? newReactionEmoji.toString()
          : newChannel.defaultReactionEmoji?.name || "N/A",
      }),
    );
}

export function buildForumSortOrderEmbed(
  oldSort: SortOrderType | null,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  const newSort = newChannel.defaultSortOrder;
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.forumDefaultSortOrderChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.forumDefaultSortOrderChange.embed.description, {
        channel: newChannel,
        old_sort_order: oldSort !== null ? t(($) => $.channelUpdate.forumDefaultSortOrderChange.modes[oldSort]) : "N/A",
        new_sort_order: newSort !== null ? t(($) => $.channelUpdate.forumDefaultSortOrderChange.modes[newSort]) : "N/A",
      }),
    );
}

export function buildForumLayoutEmbed(
  oldLayout: ForumLayoutType,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.channelUpdate.forumDefaultForumLayoutChange.embed.title))
    .setDescription(
      t(($) => $.channelUpdate.forumDefaultForumLayoutChange.embed.description, {
        channel: newChannel,
        old_layout: t(($) => $.channelUpdate.forumDefaultForumLayoutChange.layouts[oldLayout]),
        new_layout: t(($) => $.channelUpdate.forumDefaultForumLayoutChange.layouts[newChannel.defaultForumLayout]),
      }),
    );
}

export function buildForumTagsUpdateEmbeds(
  oldChannel: ForumChannel,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction<"loggers", "channelEvents">,
): EmbedBuilder[] {
  const diff = diffGuildForumTags(oldChannel.availableTags, newChannel.availableTags);
  const embeds: EmbedBuilder[] = [];
  const confirm = newChannel.client.allEmojis.get(newChannel.client.config.emojis.confirm.id)?.format;
  const reject = newChannel.client.allEmojis.get(newChannel.client.config.emojis.reject.id)?.format;

  // Added Tags
  if (diff.added.length > 0) {
    embeds.push(
      createBaseEmbed(newChannel, executor, t)
        .setColor("Green")
        .setTitle(t(($) => $.channelUpdate.forumAvailableTagsChange.added.embed.title))
        .setDescription(
          t(($) => $.channelUpdate.forumAvailableTagsChange.added.embed.description, {
            channel: newChannel,
            tag_name: diff.added.map((tag) => tag.name).join(", "),
            tag_moderation_only: diff.added.map((tag) => (tag.moderated ? confirm : reject)).join(", "),
            tag_emoji: diff.added
              .map((tag) =>
                tag.emoji?.id ? newChannel.guild.emojis.cache.get(tag.emoji.id)?.toString() : tag.emoji?.name,
              )
              .join(", "),
          }),
        ),
    );
  }

  // Removed Tags
  if (diff.removed.length > 0) {
    embeds.push(
      createBaseEmbed(newChannel, executor, t)
        .setColor("Red")
        .setTitle(t(($) => $.channelUpdate.forumAvailableTagsChange.removed.embed.title))
        .setDescription(
          t(($) => $.channelUpdate.forumAvailableTagsChange.removed.embed.description, {
            channel: newChannel,
            tag_name: diff.removed.map((tag) => tag.name).join(", "),
            tag_moderation_only: diff.removed.map((tag) => (tag.moderated ? confirm : reject)).join(", "),
            tag_emoji: diff.removed
              .map((tag) =>
                tag.emoji?.id ? newChannel.guild.emojis.cache.get(tag.emoji.id)?.toString() : tag.emoji?.name,
              )
              .join(", "),
          }),
        ),
    );
  }

  // Updated Tags
  if (diff.updated.length > 0) {
    const descriptionLines: string[] = [];

    for (const update of diff.updated) {
      const changes = update.changes;
      descriptionLines.push(
        t(($) => $.channelUpdate.forumAvailableTagsChange.updated.embed.description, {
          channel: newChannel,
          old_tag_name: changes.name ? changes.name.old : "N/A",
          new_tag_name: changes.name ? changes.name.new : "N/A",
          old_tag_moderation_only: changes.moderated ? (changes.moderated.old ? confirm : reject) : "N/A",
          new_tag_moderation_only: changes.moderated ? (changes.moderated.new ? confirm : reject) : "N/A",
          old_tag_emoji: changes.emoji
            ? formatUpdatedTagEmoji(
                newChannel.guild,
                changes.emoji.old as GuildForumTagEmoji | string | null | undefined,
              )
            : "N/A",
          new_tag_emoji: changes.emoji
            ? formatUpdatedTagEmoji(
                newChannel.guild,
                changes.emoji.new as GuildForumTagEmoji | string | null | undefined,
              )
            : "N/A",
        }),
      );
      descriptionLines.push("");
    }

    embeds.push(
      createBaseEmbed(newChannel, executor, t)
        .setColor("Yellow")
        .setTitle(t(($) => $.channelUpdate.forumAvailableTagsChange.updated.embed.title))
        .setDescription(descriptionLines.join("\n")),
    );
  }

  return embeds;
}
