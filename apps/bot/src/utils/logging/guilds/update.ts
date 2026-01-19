import { ChannelType, EmbedBuilder, Guild, GuildFeature } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { getGuildExecutor, returnWebhook, WebhookType } from "@utils";
import { isDeepStrictEqual } from "node:util";
import * as Embeds from "./updateEmbeds.js";
import { logger } from "@lib";

export async function logGuildUpdate(oldGuild: Guild, newGuild: Guild, guildConfig: GuildWithLogs) {
  // 1. Config Check
  if (!guildConfig.logConfig?.guildLogsChannelId) return;
  const logsChannel = newGuild.channels.cache.get(guildConfig.logConfig.guildLogsChannelId);
  if (logsChannel?.type !== ChannelType.GuildText) return;

  // 2. Fetch Executor & Translation
  const executor = await getGuildExecutor(newGuild);
  const t = newGuild.client.i18next.getFixedT(guildConfig.language, "loggers", "guildEvents");
  const embeds: EmbedBuilder[] = [];

  // 3. Comparisons
  if (oldGuild.afkChannel?.id !== newGuild.afkChannel?.id) {
    embeds.push(Embeds.buildAfkChannelEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
    embeds.push(Embeds.buildAfkTimeoutEmbed(oldGuild.afkTimeout, newGuild, executor, guildConfig.language, t));
  }

  if (oldGuild.banner !== newGuild.banner) {
    embeds.push(Embeds.buildBannerEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.defaultMessageNotifications !== newGuild.defaultMessageNotifications) {
    embeds.push(Embeds.buildNotificationEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.discoverySplash !== newGuild.discoverySplash) {
    embeds.push(Embeds.buildDiscoverySplashEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.explicitContentFilter !== newGuild.explicitContentFilter) {
    embeds.push(Embeds.buildExplicitContentFilterEmbed(oldGuild, newGuild, executor, t));
  }

  if (!isDeepStrictEqual(oldGuild.features.sort(), newGuild.features.sort())) {
    const removed = oldGuild.features.filter((f) => !newGuild.features.includes(f)) as GuildFeature[];
    const added = newGuild.features.filter((f) => !oldGuild.features.includes(f)) as GuildFeature[];
    if (added.length || removed.length) {
      embeds.push(Embeds.buildFeaturesEmbed(added, removed, newGuild, executor, guildConfig.language, t));
    }
  }

  if (oldGuild.icon !== newGuild.icon) {
    embeds.push(Embeds.buildIconEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.mfaLevel !== newGuild.mfaLevel) {
    embeds.push(Embeds.buildMfaLevelEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.name !== newGuild.name) {
    embeds.push(Embeds.buildNameEmbed(oldGuild.name, newGuild, executor, t));
  }

  if (oldGuild.description !== newGuild.description) {
    embeds.push(Embeds.buildDescriptionEmbed(oldGuild.description, newGuild, executor, t));
  }

  if (oldGuild.ownerId !== newGuild.ownerId) {
    embeds.push(Embeds.buildOwnerEmbed(oldGuild.ownerId, newGuild, executor, t));
  }

  if (oldGuild.partnered !== newGuild.partnered) {
    embeds.push(Embeds.buildPartneredEmbed(oldGuild.partnered, newGuild, executor, t));
  }

  if (oldGuild.preferredLocale !== newGuild.preferredLocale) {
    embeds.push(
      Embeds.buildPreferredLocaleEmbed(oldGuild.preferredLocale, newGuild, executor, guildConfig.language, t),
    );
  }

  if (oldGuild.premiumProgressBarEnabled !== newGuild.premiumProgressBarEnabled) {
    embeds.push(Embeds.buildPremiumProgressBarEmbed(oldGuild.premiumProgressBarEnabled, newGuild, executor, t));
  }

  if (oldGuild.premiumSubscriptionCount !== newGuild.premiumSubscriptionCount) {
    embeds.push(Embeds.buildPremiumSubscriptionCountEmbed(oldGuild.premiumSubscriptionCount, newGuild, executor, t));
  }

  if (oldGuild.premiumTier !== newGuild.premiumTier) {
    embeds.push(Embeds.buildPremiumTierEmbed(oldGuild.premiumTier, newGuild, executor, t));
  }

  if (oldGuild.publicUpdatesChannelId !== newGuild.publicUpdatesChannelId) {
    embeds.push(Embeds.buildPublicUpdatesChannelEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.rulesChannelId !== newGuild.rulesChannelId) {
    embeds.push(Embeds.buildRulesChannelEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.safetyAlertsChannelId !== newGuild.safetyAlertsChannelId) {
    embeds.push(Embeds.buildSafetyAlertsChannelEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.splash !== newGuild.splash) {
    embeds.push(Embeds.buildSplashEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.systemChannelId !== newGuild.systemChannelId) {
    embeds.push(Embeds.buildSystemChannelEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
    embeds.push(Embeds.buildVanityUrlEmbed(oldGuild.vanityURLCode, newGuild, executor, t));
  }

  if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
    embeds.push(Embeds.buildVerificationLevelEmbed(oldGuild.verificationLevel, newGuild, executor, t));
  }

  if (oldGuild.verified !== newGuild.verified) {
    embeds.push(Embeds.buildVerifiedEmbed(oldGuild.verified, newGuild, executor, t));
  }

  if (oldGuild.widgetChannelId !== newGuild.widgetChannelId) {
    embeds.push(Embeds.buildWidgetChannelEmbed(oldGuild, newGuild, executor, t));
  }

  if (oldGuild.systemChannelFlags !== newGuild.systemChannelFlags) {
    embeds.push(
      Embeds.buildSystemChannelFlagsEmbed(oldGuild.systemChannelFlags, newGuild, executor, guildConfig.language, t),
    );
  }

  if (oldGuild.nsfwLevel !== newGuild.nsfwLevel) {
    embeds.push(Embeds.buildNsfwLevelEmbed(oldGuild.nsfwLevel, newGuild, executor, t));
  }

  if (oldGuild.widgetEnabled !== newGuild.widgetEnabled) {
    embeds.push(Embeds.buildWidgetEnabledEmbed(oldGuild.widgetEnabled, newGuild, executor, t));
  }
  if (embeds.length === 0) {
    // 4. Send
    const ignoredKeys = [
      // Managers and internal workings we don't care about comparing directly
      "client",
      "channels",
      "roles",
      "members",
      "emojis",
      "stickers",
      "presences",
      "voiceStates",
      "stageInstances",
      "invites",
      "scheduledEvents",
      "autoModerationRules",
      "commands",
      "bans",
      "shard",
      "shardId",
      "createdAt",
      "createdTimestamp",
      "joinedAt",
      "joinedTimestamp",
    ];

    const unhandledChanges: string[] = [];

    // Loop through properties to see what actually changed
    for (const key in newGuild) {
      // 1. Skip keys we know are irrelevant or Managers
      if (ignoredKeys.includes(key)) continue;

      // 2. Skip keys if they are functions (methods)
      if (typeof newGuild[key as keyof Guild] === "function") continue;

      // 3. Compare values
      // Note: We use strict inequality. This might catch deep object ref changes
      // but is perfect for debugging "what triggered this?"
      const oldVal = oldGuild[key as keyof Guild];
      const newVal = newGuild[key as keyof Guild];

      if (oldVal !== newVal) {
        // Optional: Filter out empty/null mismatches if you want less noise
        if (!oldVal && !newVal) continue;

        unhandledChanges.push(key);
      }
    }

    if (unhandledChanges.length > 0) {
      logger.log({
        level: "warn", // Use warn so it stands out in your console
        message: `[GuildUpdate] Unhandled change detected in "${newGuild.name}" (${newGuild.id}). Keys changed: [${unhandledChanges.join(", ")}]`,
      });
    }
    return;
  }

  const webhook = await returnWebhook(newGuild.client, logsChannel, newGuild.id, guildConfig, {
    id: guildConfig.logConfig.guildLogsWebhookId,
    type: WebhookType.GUILD_LOGS,
  });

  if (webhook) {
    await webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildUpdate embed in ${newGuild.name} (${newGuild.id})`,
        channelId: logsChannel.id,
      });
    });
  }
}
