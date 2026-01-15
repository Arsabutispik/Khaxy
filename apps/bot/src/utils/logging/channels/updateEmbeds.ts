import {
  ChannelType,
  EmbedBuilder,
  ForumChannel,
  GuildForumTagEmoji,
  NonThreadGuildBasedChannel,
  TextChannel,
  User,
  VoiceChannel,
} from "discord.js";
import { formatDuration, formatUpdatedTagEmoji, diffGuildForumTags, diffPermissions } from "@utils";
import { TFunction } from "i18next";

function createBaseEmbed(channel: NonThreadGuildBasedChannel, executor: User | null, t: TFunction): EmbedBuilder {
  return new EmbedBuilder()
    .setColor("Yellow")
    .setThumbnail(channel.guild.iconURL() ?? null)
    .setTimestamp()
    .setFooter({
      text: executor?.tag ?? t(($) => $.unknown_executor),
      iconURL: executor?.displayAvatarURL() ?? undefined,
    });
}

export function buildNameChangeEmbed(
  oldName: string,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  t: TFunction,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.name_change.embed.title))
    .setDescription(
      t(($) => $.name_change.embed.description, {
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
  t: TFunction,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.topic_change.embed.title))
    .setDescription(
      t(($) => $.topic_change.embed.description, {
        channel: newChannel,
        old_topic: oldTopic || t("no_topic"),
        new_topic: (newChannel as TextChannel).topic || t("no_topic"),
      }),
    );
}

export function buildNsfwChangeEmbed(
  oldNsfw: boolean,
  newChannel: NonThreadGuildBasedChannel & { nsfw: boolean },
  executor: User | null,
  t: TFunction,
): EmbedBuilder {
  const getEmoji = (state: boolean) =>
    state
      ? newChannel.client.allEmojis.get(newChannel.client.config.emojis.confirm.id)?.format
      : newChannel.client.allEmojis.get(newChannel.client.config.emojis.reject.id)?.format;

  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.nsfw_change.embed.title))
    .setDescription(
      t(($) => $.nsfw_change.embed.description, {
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
  t: TFunction,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.type_change.embed.title))
    .setDescription(
      t(($) => $.type_change.embed.description, {
        channel: newChannel,
        old_type: t(`channel_types.${oldType}`),
        new_type: t(($) => $.channel_types.${newChannel.type}),
      }),
    );
}

export function buildPermissionsChangeEmbed(
  oldChannel: NonThreadGuildBasedChannel,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  language: string,
  t: TFunction,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.permissions_change.embed.title))
    .setDescription(
      t(($) => $.permissions_change.embed.description, {
        channel: newChannel,
        changes: diffPermissions(newChannel.client, oldChannel, newChannel, language) || t("no_changes"),
      }),
    );
}

export function buildRateLimitChangeEmbed(
  oldRateLimit: number | null,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  language: string,
  t: TFunction,
): EmbedBuilder {
  const newLimit = (newChannel as TextChannel).rateLimitPerUser ?? 0;
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.rate_limit_change.embed.title))
    .setDescription(
      t(($) => $.rate_limit_change.embed.description, {
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
  t: TFunction,
): EmbedBuilder {
  const newBitrate = (newChannel as VoiceChannel).bitrate;
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.bitrate_change.embed.title))
    .setDescription(
      t(($) => $.bitrate_change.embed.description, {
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
  t: TFunction,
): EmbedBuilder {
  const newLimit = (newChannel as VoiceChannel).userLimit;
  const infinityEmoji = newChannel.client.allEmojis.get(newChannel.client.config.emojis.infinity.id)?.format;

  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.user_limit_change.embed.title))
    .setDescription(
      t(($) => $.user_limit_change.embed.description, {
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
  t: TFunction,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.rtc_region_change.embed.title))
    .setDescription(
      t(($) => $.rtc_region_change.embed.description, {
        channel: newChannel,
        old_rtc_region: oldRegion || "N/A",
        new_rtc_region: (newChannel as VoiceChannel).rtcRegion || "N/A",
      }),
    );
}

export function buildVideoQualityChangeEmbed(
  oldMode: number | null,
  newChannel: NonThreadGuildBasedChannel,
  executor: User | null,
  t: TFunction,
): EmbedBuilder {
  const newMode = (newChannel as VoiceChannel).videoQualityMode;
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.video_quality_mode_change.embed.title))
    .setDescription(
      t(($) => $.video_quality_mode_change.embed.description, {
        channel: newChannel,
        old_video_quality_mode: t(`video_quality_mode_change.modes.${oldMode}`),
        new_video_quality_mode: t(($) => $.video_quality_mode_change.modes.${newMode}),
      }),
    );
}

// ============================================================================
// EMBED BUILDERS: FORUM
// ============================================================================

export function buildForumArchiveDurationEmbed(
  oldDuration: number | null,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.default_archive_duration_change.embed.title))
    .setDescription(
      t(($) => $.default_archive_duration_change.embed.description, {
        channel: newChannel,
        old_archive_duration: t(`default_archive_duration_change.time.${oldDuration}`),
        new_archive_duration: t(($) => $.default_archive_duration_change.time.${newChannel.defaultAutoArchiveDuration}),
      }),
    );
}

export function buildForumRateLimitEmbed(
  oldRateLimit: number | null,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.forum_rate_limit_change.embed.title))
    .setDescription(
      t(($) => $.forum_rate_limit_change.embed.description, {
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
  t: TFunction,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.forum_default_thread_rate_limit_change.embed.title))
    .setDescription(
      t(($) => $.forum_default_thread_rate_limit_change.embed.description, {
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
  t: TFunction,
): EmbedBuilder {
  const oldReactionEmoji = newChannel.guild.emojis.cache.get(oldEmojiId || "0");
  const newReactionEmoji = newChannel.guild.emojis.cache.get(newChannel.defaultReactionEmoji?.id || "0");

  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.forum_default_reaction_emoji_change.embed.title))
    .setDescription(
      t(($) => $.forum_default_reaction_emoji_change.embed.description, {
        channel: newChannel,
        old_reaction_emoji: oldReactionEmoji ? oldReactionEmoji.toString() : oldEmojiName || "N/A",
        new_reaction_emoji: newReactionEmoji
          ? newReactionEmoji.toString()
          : newChannel.defaultReactionEmoji?.name || "N/A",
      }),
    );
}

export function buildForumSortOrderEmbed(
  oldSort: number | null,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.forum_default_sort_order_change.embed.title))
    .setDescription(
      t(($) => $.forum_default_sort_order_change.embed.description, {
        channel: newChannel,
        old_sort_order: t(`forum_default_sort_order_change.modes.${oldSort}`),
        new_sort_order: t(($) => $.forum_default_sort_order_change.modes.${newChannel.defaultSortOrder}),
      }),
    );
}

export function buildForumLayoutEmbed(
  oldLayout: number,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction,
): EmbedBuilder {
  return createBaseEmbed(newChannel, executor, t)
    .setTitle(t(($) => $.forum_default_forum_layout_change.embed.title))
    .setDescription(
      t(($) => $.forum_default_forum_layout_change.embed.description, {
        channel: newChannel,
        old_layout: t(`forum_default_forum_layout_change.layouts.${oldLayout}`),
        new_layout: t(($) => $.forum_default_forum_layout_change.layouts.${newChannel.defaultForumLayout}),
      }),
    );
}

export function buildForumTagsUpdateEmbeds(
  oldChannel: ForumChannel,
  newChannel: ForumChannel,
  executor: User | null,
  t: TFunction,
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
        .setTitle(t(($) => $.forum_available_tags_change.added.embed.title))
        .setDescription(
          t(($) => $.forum_available_tags_change.added.embed.description, {
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
        .setTitle(t(($) => $.forum_available_tags_change.removed.embed.title))
        .setDescription(
          t(($) => $.forum_available_tags_change.removed.embed.description, {
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
        t(($) => $.forum_available_tags_change.updated.embed.description, {
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
        .setTitle(t(($) => $.forum_available_tags_change.updated.embed.title))
        .setDescription(descriptionLines.join("\n")),
    );
  }

  return embeds;
}