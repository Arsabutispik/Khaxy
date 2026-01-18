import { ChannelType, EmbedBuilder, ForumChannel, NonThreadGuildBasedChannel } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";
import { isDeepStrictEqual } from "node:util";
import { getChannelExecutor, normalizeOverwrites } from "./utils.js";
import * as Embeds from "./updateEmbeds.js";

export async function logChannelUpdates(
  oldChannel: NonThreadGuildBasedChannel,
  newChannel: NonThreadGuildBasedChannel,
  guildConfig: GuildWithLogs,
) {
  if (!guildConfig.logConfig?.channelLogsChannelId) return;

  const logChannel = oldChannel.guild.channels.cache.get(guildConfig.logConfig.channelLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  const executor = await getChannelExecutor(newChannel.guild, newChannel.id);
  const t = newChannel.client.i18next.getFixedT(guildConfig.language, "loggers", "channelEvents");

  const embeds: EmbedBuilder[] = [];

  // ========================================================================
  // GENERAL CHANNEL CHECKS
  // ========================================================================

  // Name Change
  if (oldChannel.name !== newChannel.name) {
    embeds.push(Embeds.buildNameChangeEmbed(oldChannel.name, newChannel, executor, t));
  }

  // Topic Change (Text & News Only)
  if (
    oldChannel.isTextBased() &&
    newChannel.isTextBased() &&
    !oldChannel.isVoiceBased() &&
    !newChannel.isVoiceBased() &&
    (oldChannel.topic || null) !== (newChannel.topic || null)
  ) {
    embeds.push(Embeds.buildTopicChangeEmbed(oldChannel.topic, newChannel, executor, t));
  }

  // NSFW Change
  if (oldChannel.isTextBased() && newChannel.isTextBased() && oldChannel.nsfw !== newChannel.nsfw) {
    // We cast to "any" or intersection here because isTextBased guarantees nsfw exists broadly,
    // but TS gets strict about specific channel types in the union.
    embeds.push(
      Embeds.buildNsfwChangeEmbed(
        oldChannel.nsfw,
        newChannel as NonThreadGuildBasedChannel & { nsfw: boolean },
        executor,
        t,
      ),
    );
  }

  // Type Change
  if (oldChannel.type !== newChannel.type) {
    embeds.push(Embeds.buildTypeChangeEmbed(oldChannel.type, newChannel, executor, t));
  }

  // Slowmode Change (Standard Text/News/VoiceText)
  // We explicitly exclude Forums here because they have two different rate limits.
  if (
    oldChannel.isTextBased() &&
    newChannel.isTextBased() &&
    oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser &&
    !(oldChannel instanceof ForumChannel)
  ) {
    embeds.push(
      Embeds.buildRateLimitChangeEmbed(oldChannel.rateLimitPerUser, newChannel, executor, guildConfig.language, t),
    );
  }

  // Permission Overwrites Change
  const oldPerms = normalizeOverwrites(oldChannel);
  const newPerms = normalizeOverwrites(newChannel);
  if (!isDeepStrictEqual(oldPerms, newPerms)) {
    embeds.push(Embeds.buildPermissionsChangeEmbed(oldChannel, newChannel, executor, guildConfig.language, t));
  }

  // ========================================================================
  // VOICE CHANNEL CHECKS
  // ========================================================================
  if (oldChannel.isVoiceBased() && newChannel.isVoiceBased()) {
    if (oldChannel.bitrate !== newChannel.bitrate) {
      embeds.push(Embeds.buildBitrateChangeEmbed(oldChannel.bitrate, newChannel, executor, t));
    }
    if (oldChannel.userLimit !== newChannel.userLimit) {
      embeds.push(Embeds.buildUserLimitChangeEmbed(oldChannel.userLimit, newChannel, executor, t));
    }
    if (oldChannel.rtcRegion !== newChannel.rtcRegion) {
      embeds.push(Embeds.buildRtcRegionChangeEmbed(oldChannel.rtcRegion, newChannel, executor, t));
    }
    if (oldChannel.videoQualityMode !== newChannel.videoQualityMode) {
      embeds.push(Embeds.buildVideoQualityChangeEmbed(oldChannel.videoQualityMode, newChannel, executor, t));
    }
  }

  // ========================================================================
  // FORUM CHANNEL CHECKS
  // ========================================================================
  if (oldChannel.type === ChannelType.GuildForum && newChannel.type === ChannelType.GuildForum) {
    if (oldChannel.defaultAutoArchiveDuration !== newChannel.defaultAutoArchiveDuration) {
      embeds.push(
        Embeds.buildForumArchiveDurationEmbed(oldChannel.defaultAutoArchiveDuration, newChannel, executor, t),
      );
    }
    // Forum-specific post rate limit
    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
      embeds.push(Embeds.buildForumRateLimitEmbed(oldChannel.rateLimitPerUser, newChannel, executor, t));
    }
    // Forum thread message rate limit
    if (oldChannel.defaultThreadRateLimitPerUser !== newChannel.defaultThreadRateLimitPerUser) {
      embeds.push(
        Embeds.buildForumThreadRateLimitEmbed(oldChannel.defaultThreadRateLimitPerUser, newChannel, executor, t),
      );
    }
    if (oldChannel.defaultSortOrder !== newChannel.defaultSortOrder) {
      embeds.push(Embeds.buildForumSortOrderEmbed(oldChannel.defaultSortOrder, newChannel, executor, t));
    }
    if (oldChannel.defaultForumLayout !== newChannel.defaultForumLayout) {
      embeds.push(Embeds.buildForumLayoutEmbed(oldChannel.defaultForumLayout, newChannel, executor, t));
    }
    if (oldChannel.defaultReactionEmoji?.name !== newChannel.defaultReactionEmoji?.name) {
      embeds.push(
        Embeds.buildForumReactionEmojiEmbed(
          oldChannel.defaultReactionEmoji?.id,
          oldChannel.defaultReactionEmoji?.name,
          newChannel,
          executor,
          t,
        ),
      );
    }
    // Available Tags (Requires Diffing)
    if (!isDeepStrictEqual(oldChannel.availableTags, newChannel.availableTags)) {
      const tagEmbeds = Embeds.buildForumTagsUpdateEmbeds(oldChannel, newChannel, executor, t);
      embeds.push(...tagEmbeds);
    }
  }

  // ========================================================================
  // SEND LOGS
  // ========================================================================
  if (embeds.length === 0) return;

  const webhook = await returnWebhook(newChannel.client, logChannel, newChannel.guild.id, guildConfig, {
    id: guildConfig.logConfig?.channelLogsWebhookId,
    type: WebhookType.CHANNEL_LOGS,
  });

  if (webhook) {
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
