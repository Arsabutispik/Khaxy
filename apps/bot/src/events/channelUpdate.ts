import { EventBase } from "src/types/index.js";
import {
  Events,
  ChannelType,
  EmbedBuilder,
  AuditLogEvent,
  GuildForumTagEmoji,
  CategoryChannel,
  NewsChannel,
  StageChannel,
  TextChannel,
  VoiceChannel,
  ForumChannel,
  MediaChannel,
  NonThreadGuildBasedChannel,
  DMChannel,
} from "discord.js";
import { getOrCreateGuild, GuildWithLogs } from "@repo/database";
import {
  diffGuildForumTags,
  diffPermissions,
  formatDuration,
  formatUpdatedTagEmoji,
  returnWebhook,
  sleep,
  WebhookType,
} from "src/utils/index.js";
import { logger } from "src/lib/index.js";
import { isDeepStrictEqual } from "node:util";

export default {
  name: Events.ChannelUpdate,
  once: false,
  async execute(oldChannel, newChannel) {
    if (oldChannel.isDMBased() || newChannel.isDMBased()) return; // Ensure the channel is part of a guild
    const guildConfig = await getOrCreateGuild(oldChannel.guildId);
    if (!guildConfig) return;
    await logChannelUpdates(oldChannel, newChannel, guildConfig);
  },
} satisfies EventBase<Events.ChannelUpdate>;

async function logChannelUpdates(
  oldChannel: NonThreadGuildBasedChannel,
  newChannel: NonThreadGuildBasedChannel,
  guildConfig: GuildWithLogs,
) {
  if (!guildConfig.logConfig?.channelLogsChannelId) return;
  const t = oldChannel.client.i18next.getFixedT(guildConfig.language, "events", "channelUpdate");
  const logChannel = oldChannel.guild.channels.cache.get(guildConfig.logConfig.channelLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  await sleep(2000); // Wait for 2 seconds to ensure audit logs are updated

  const auditLogs = await oldChannel.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelUpdate,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  const executor = logEntry && logEntry.target?.id === newChannel.id ? logEntry.executor : null;

  const webhook = await returnWebhook(newChannel.client, logChannel, newChannel.guild.id, guildConfig, {
    id: guildConfig.logConfig?.channelLogsWebhookId,
    type: WebhookType.CHANNEL_LOGS,
  });
  let embeds: Array<EmbedBuilder> = [];
  const embed = new EmbedBuilder()
    .setColor("Yellow")
    .setThumbnail(newChannel.guild.iconURL() ?? null)
    .setTimestamp()
    .setFooter({
      text: executor?.tag ?? t("unknown_executor"),
      iconURL: executor?.displayAvatarURL() ?? undefined,
    });
  if (oldChannel.name !== newChannel.name) {
    embed.setTitle(t("name_change.embed.title")).setDescription(
      t("name_change.embed.description", {
        channel: newChannel,
        old_name: oldChannel.name,
        new_name: newChannel.name,
      }),
    );
    embeds.push(embed);
  }

  if (
    oldChannel.isTextBased() &&
    !oldChannel.isVoiceBased() &&
    newChannel.isTextBased() &&
    !newChannel.isVoiceBased() &&
    (oldChannel.topic || null) !== (newChannel.topic || null)
  ) {
    embed.setTitle(t("topic_change.embed.title")).setDescription(
      t("topic_change.embed.description", {
        channel: newChannel,
        old_topic: oldChannel.topic || t("no_topic"),
        new_topic: newChannel.topic || t("no_topic"),
      }),
    );
    embeds.push(embed);
  }
  if (oldChannel.isTextBased() && newChannel.isTextBased() && oldChannel.nsfw !== newChannel.nsfw) {
    embed.setTitle(t("nsfw_change.embed.title")).setDescription(
      t("nsfw_change.embed.description", {
        channel: newChannel,
        old_nsfw: oldChannel.nsfw
          ? oldChannel.client.allEmojis.get(oldChannel.client.config.emojis.confirm.id)?.format
          : oldChannel.client.allEmojis.get(oldChannel.client.config.emojis.reject.id)?.format,
        new_nsfw: newChannel.nsfw
          ? newChannel.client.allEmojis.get(newChannel.client.config.emojis.confirm.id)?.format
          : newChannel.client.allEmojis.get(newChannel.client.config.emojis.reject.id)?.format,
      }),
    );
    embeds.push(embed);
  }

  function normalizeOverwrites(
    channel: CategoryChannel | NewsChannel | StageChannel | TextChannel | VoiceChannel | ForumChannel | MediaChannel,
  ) {
    return channel.permissionOverwrites.cache
      .map((po) => ({
        id: po.id,
        type: po.type,
        allow: po.allow.bitfield.toString(),
        deny: po.deny.bitfield.toString(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  const oldPerms = normalizeOverwrites(oldChannel);
  const newPerms = normalizeOverwrites(newChannel);
  if (!isDeepStrictEqual(oldPerms, newPerms)) {
    embed.setTitle(t("permissions_change.embed.title")).setDescription(
      t("permissions_change.embed.description", {
        channel: newChannel,
        changes: diffPermissions(newChannel.client, oldChannel, newChannel, guildConfig.language) || t("no_changes"),
      }),
    );
    embeds.push(embed);
  }
  if (oldChannel.type !== newChannel.type) {
    embed.setTitle(t("type_change.embed.title")).setDescription(
      t("type_change.embed.description", {
        channel: newChannel,
        old_type: t(`channel_types.${oldChannel.type}`),
        new_type: t(`channel_types.${newChannel.type}`),
      }),
    );
    embeds.push(embed);
  }
  if (oldChannel.isVoiceBased() && newChannel.isVoiceBased() && oldChannel.bitrate !== newChannel.bitrate) {
    embed.setTitle(t("bitrate_change.embed.title")).setDescription(
      t("bitrate_change.embed.description", {
        channel: newChannel,
        old_bitrate: `${oldChannel.bitrate.toString().slice(0, 2)}kbps`,
        new_bitrate: `${newChannel.bitrate.toString().slice(0, 2)}kbps`,
      }),
    );
    embeds.push(embed);
  }
  if (oldChannel.isVoiceBased() && newChannel.isVoiceBased() && oldChannel.userLimit !== newChannel.userLimit) {
    embed.setTitle(t("user_limit_change.embed.title")).setDescription(
      t("user_limit_change.embed.description", {
        channel: newChannel,
        old_user_limit:
          oldChannel.userLimit > 0
            ? oldChannel.userLimit
            : newChannel.client.allEmojis.get(newChannel.client.config.emojis.infinity.id)?.format,
        new_user_limit:
          newChannel.userLimit > 0
            ? newChannel.userLimit
            : newChannel.client.allEmojis.get(newChannel.client.config.emojis.infinity.id)?.format,
      }),
    );
    embeds.push(embed);
  }
  if (
    oldChannel.isTextBased() &&
    newChannel.isTextBased() &&
    oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser
  ) {
    embed.setTitle(t("rate_limit_change.embed.title")).setDescription(
      t("rate_limit_change.embed.description", {
        channel: newChannel,
        old_rate_limit: formatDuration(oldChannel.rateLimitPerUser! * 1000, guildConfig.language),
        new_rate_limit: formatDuration(newChannel.rateLimitPerUser! * 1000, guildConfig.language),
      }),
    );
    embeds.push(embed);
  }
  if (oldChannel.isVoiceBased() && newChannel.isVoiceBased() && oldChannel.rtcRegion !== newChannel.rtcRegion) {
    embed.setTitle(t("rtc_region_change.embed.title")).setDescription(
      t("rtc_region_change.embed.description", {
        channel: newChannel,
        old_rtc_region: oldChannel.rtcRegion || "N/A",
        new_rtc_region: newChannel.rtcRegion || "N/A",
      }),
    );
    embeds.push(embed);
  }
  if (
    oldChannel.isVoiceBased() &&
    newChannel.isVoiceBased() &&
    oldChannel.videoQualityMode !== newChannel.videoQualityMode
  ) {
    embed.setTitle(t("video_quality_mode_change.embed.title")).setDescription(
      t("video_quality_mode_change.embed.description", {
        channel: newChannel,
        old_video_quality_mode: t(`video_quality_mode_change.modes.${oldChannel.videoQualityMode}`),
        new_video_quality_mode: t(`video_quality_mode_change.modes.${newChannel.videoQualityMode}`),
      }),
    );
    embeds.push(embed);
  }
  if (
    oldChannel.type === ChannelType.GuildForum &&
    newChannel.type === ChannelType.GuildForum &&
    oldChannel.defaultAutoArchiveDuration !== newChannel.defaultAutoArchiveDuration
  ) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t("default_archive_duration_change.embed.title"))
      .setDescription(
        t("default_archive_duration_change.embed.description", {
          channel: newChannel,
          old_archive_duration: t(`default_archive_duration_change.time.${oldChannel.defaultAutoArchiveDuration}`),
          new_archive_duration: t(`default_archive_duration_change.time.${newChannel.defaultAutoArchiveDuration}`),
        }),
      );
    embeds.push(embedClone);
  }
  if (
    oldChannel.type === ChannelType.GuildForum &&
    newChannel.type === ChannelType.GuildForum &&
    oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser
  ) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t("forum_rate_limit_change.embed.title"))
      .setDescription(
        t("forum_rate_limit_change.embed.description", {
          channel: newChannel,
          old_rate_limit: `${oldChannel.rateLimitPerUser}s`,
          new_rate_limit: `${newChannel.rateLimitPerUser}s`,
        }),
      );
    embeds.push(embedClone);
  }
  if (
    oldChannel.type === ChannelType.GuildForum &&
    newChannel.type === ChannelType.GuildForum &&
    oldChannel.defaultThreadRateLimitPerUser !== newChannel.defaultThreadRateLimitPerUser
  ) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t("forum_default_thread_rate_limit_change.embed.title"))
      .setDescription(
        t("forum_default_thread_rate_limit_change.embed.description", {
          channel: newChannel,
          old_rate_limit: `${oldChannel.defaultThreadRateLimitPerUser}s`,
          new_rate_limit: `${newChannel.defaultThreadRateLimitPerUser}s`,
        }),
      );
    embeds.push(embedClone);
  }
  if (
    oldChannel.type === ChannelType.GuildForum &&
    newChannel.type === ChannelType.GuildForum &&
    oldChannel.defaultReactionEmoji?.name !== newChannel.defaultReactionEmoji?.name
  ) {
    const old_reaction_emoji = newChannel.guild.emojis.cache.get(oldChannel.defaultReactionEmoji?.id || "0");
    const new_reaction_emoji = newChannel.guild.emojis.cache.get(newChannel.defaultReactionEmoji?.id || "0");
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t("forum_default_reaction_emoji_change.embed.title"))
      .setDescription(
        t("forum_default_reaction_emoji_change.embed.description", {
          channel: newChannel,
          old_reaction_emoji: old_reaction_emoji
            ? old_reaction_emoji.toString()
            : oldChannel.defaultReactionEmoji?.name || "N/A",
          new_reaction_emoji: new_reaction_emoji
            ? new_reaction_emoji.toString()
            : newChannel.defaultReactionEmoji?.name || "N/A",
        }),
      );
    embeds.push(embedClone);
  }
  if (
    oldChannel.type === ChannelType.GuildForum &&
    newChannel.type === ChannelType.GuildForum &&
    oldChannel.defaultSortOrder !== newChannel.defaultSortOrder
  ) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t("forum_default_sort_order_change.embed.title"))
      .setDescription(
        t("forum_default_sort_order_change.embed.description", {
          channel: newChannel,
          old_sort_order: t(`forum_default_sort_order_change.modes.${oldChannel.defaultSortOrder}`),
          new_sort_order: t(`forum_default_sort_order_change.modes.${newChannel.defaultSortOrder}`),
        }),
      );
    embeds.push(embedClone);
  }
  if (
    oldChannel.type === ChannelType.GuildForum &&
    newChannel.type === ChannelType.GuildForum &&
    !isDeepStrictEqual(oldChannel.availableTags, newChannel.availableTags)
  ) {
    const diff = diffGuildForumTags(oldChannel.availableTags, newChannel.availableTags);
    const embedClone = EmbedBuilder.from(embed);
    if (diff.added.length > 0) {
      embedClone
        .setColor("Green")
        .setTitle(t("forum_available_tags_change.added.embed.title"))
        .setDescription(
          t("forum_available_tags_change.added.embed.description", {
            channel: newChannel,
            tag_name: diff.added.map((tag) => tag.name).join(", "),
            tag_moderation_only: diff.added
              .map((tag) =>
                tag.moderated
                  ? newChannel.client.allEmojis.get(newChannel.client.config.emojis.confirm.id)?.format
                  : newChannel.client.allEmojis.get(newChannel.client.config.emojis.reject.id)?.format,
              )
              .join(", "),
            tag_emoji: diff.added
              .map((tag) =>
                tag.emoji?.id ? newChannel.guild.emojis.cache.get(tag.emoji.id)?.toString() : tag.emoji?.name,
              )
              .join(", "),
          }),
        );
      embeds.push(embedClone);
    } else if (diff.removed.length > 0) {
      embedClone
        .setColor("Red")
        .setTitle(t("forum_available_tags_change.removed.embed.title"))
        .setDescription(
          t("forum_available_tags_change.removed.embed.description", {
            channel: newChannel,
            tag_name: diff.removed.map((tag) => tag.name).join(", "),
            tag_moderation_only: diff.removed
              .map((tag) =>
                tag.moderated
                  ? newChannel.client.allEmojis.get(newChannel.client.config.emojis.confirm.id)?.format
                  : newChannel.client.allEmojis.get(newChannel.client.config.emojis.reject.id)?.format,
              )
              .join(", "),
            tag_emoji: diff.removed
              .map((tag) =>
                tag.emoji?.id ? newChannel.guild.emojis.cache.get(tag.emoji.id)?.toString() : tag.emoji?.name,
              )
              .join(", "),
          }),
        );
      embeds.push(embedClone);
    } else if (diff.updated.length > 0) {
      const descriptionLines: string[] = [];

      for (const update of diff.updated) {
        const changes = update.changes;
        const tag = newChannel.availableTags.find((t) => t.id === update.id);
        if (!tag) continue;

        descriptionLines.push(
          t("forum_available_tags_change.updated.embed.description", {
            channel: newChannel,
            old_tag_name: changes.name ? changes.name.old : "N/A",
            new_tag_name: changes.name ? changes.name.new : "N/A",
            old_tag_moderation_only: changes.moderated
              ? changes.moderated.old
                ? newChannel.client.allEmojis.get(newChannel.client.config.emojis.confirm.id)?.format
                : newChannel.client.allEmojis.get(newChannel.client.config.emojis.reject.id)?.format
              : "N/A",
            new_tag_moderation_only: changes.moderated
              ? changes.moderated.new
                ? newChannel.client.allEmojis.get(newChannel.client.config.emojis.confirm.id)?.format
                : newChannel.client.allEmojis.get(newChannel.client.config.emojis.reject.id)?.format
              : "N/A",
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

        descriptionLines.push(""); // blank line between updates
      }

      embedClone
        .setColor("Yellow")
        .setTitle(t("forum_available_tags_change.updated.embed.title"))
        .setDescription(descriptionLines.join("\n"));
      embeds.push(embedClone);
    }
  }
  if (
    oldChannel.type === ChannelType.GuildForum &&
    newChannel.type === ChannelType.GuildForum &&
    oldChannel.defaultForumLayout !== newChannel.defaultForumLayout
  ) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t("forum_default_forum_layout_change.embed.title"))
      .setDescription(
        t("forum_default_forum_layout_change.embed.description", {
          channel: newChannel,
          old_layout: t(`forum_default_forum_layout_change.layouts.${oldChannel.defaultForumLayout}`),
          new_layout: t(`forum_default_forum_layout_change.layouts.${newChannel.defaultForumLayout}`),
        }),
      );
    embeds.push(embedClone);
  }
  if (
    oldChannel.type === ChannelType.GuildForum &&
    newChannel.type === ChannelType.GuildForum &&
    oldChannel.nsfw !== newChannel.nsfw
  ) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t("forum_nsfw_change.embed.title"))
      .setDescription(
        t("forum_nsfw_change.embed.description", {
          channel: newChannel,
          old_nsfw: oldChannel.nsfw
            ? oldChannel.client.allEmojis.get(oldChannel.client.config.emojis.confirm.id)?.format
            : oldChannel.client.allEmojis.get(oldChannel.client.config.emojis.reject.id)?.format,
          new_nsfw: newChannel.nsfw
            ? newChannel.client.allEmojis.get(newChannel.client.config.emojis.confirm.id)?.format
            : newChannel.client.allEmojis.get(newChannel.client.config.emojis.reject.id)?.format,
        }),
      );
    embeds.push(embedClone);
  }
  if (embeds.length > 0 && webhook) {
    await webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send channelUpdate embed in ${newChannel.guild.name} (${newChannel.guild.id})`,
        channelId: logChannel.id,
      });
    });
  }
}
