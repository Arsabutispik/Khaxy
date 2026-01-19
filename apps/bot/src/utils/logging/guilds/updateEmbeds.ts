import {
  EmbedBuilder,
  Guild,
  GuildFeature,
  GuildVerificationLevel,
  Locale,
  GuildNSFWLevel,
  SystemChannelFlagsBitField,
  User,
} from "discord.js";
import { TFunction } from "i18next";
import { formatDuration } from "@utils";

// ============================================================================
// BASE HELPER
// ============================================================================

function createBaseEmbed(guild: Guild, executor: User | null, t: TFunction<"loggers", "guildEvents">) {
  const embed = new EmbedBuilder().setColor("Yellow").setTimestamp().setThumbnail(guild.iconURL());

  if (executor) {
    embed.setFooter({
      text: executor.tag || t(($) => $.unknownExecutor),
      iconURL: executor.displayAvatarURL(),
    });
  }

  return embed;
}

// ============================================================================
// PROPERTY BUILDERS
// ============================================================================

export function buildAfkChannelEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.afkChannelChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.afkChannelChange.embed.description, {
        old_channel: oldGuild.afkChannel ? `<#${oldGuild.afkChannel.id}>` : t(($) => $.none),
        new_channel: newGuild.afkChannel ? `<#${newGuild.afkChannel.id}>` : t(($) => $.none),
      }),
    );
}

export function buildAfkTimeoutEmbed(
  oldTimeout: number,
  newGuild: Guild,
  executor: User | null,
  language: string,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.afkTimeoutChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.afkTimeoutChange.embed.description, {
        old_timeout: formatDuration(oldTimeout * 1000, language),
        new_timeout: formatDuration(newGuild.afkTimeout * 1000, language),
      }),
    );
}

export function buildBannerEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.bannerChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.bannerChange.embed.description, {
        old_banner: oldGuild.banner ? `${oldGuild.bannerURL()}` : t(($) => $.none),
        new_banner: newGuild.banner ? `${newGuild.bannerURL()}` : t(($) => $.none),
      }),
    );
}

export function buildNotificationEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.defaultMessageNotificationsChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.defaultMessageNotificationsChange.embed.description, {
        old_level: t(($) => $.notificationLevels[oldGuild.defaultMessageNotifications]),
        new_level: t(($) => $.notificationLevels[newGuild.defaultMessageNotifications]),
      }),
    );
}

export function buildDiscoverySplashEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.discoverySplashChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.discoverySplashChange.embed.description, {
        old_discovery_splash: oldGuild.discoverySplash ? `${oldGuild.discoverySplashURL()}` : t(($) => $.none),
        new_discovery_splash: newGuild.discoverySplash ? `${newGuild.discoverySplashURL()}` : t(($) => $.none),
      }),
    );
}

export function buildExplicitContentFilterEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.explicitContentFilterChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.explicitContentFilterChange.embed.description, {
        old_level: t(($) => $.explicitContentFilterLevels[oldGuild.explicitContentFilter]),
        new_level: t(($) => $.explicitContentFilterLevels[newGuild.explicitContentFilter]),
      }),
    );
}

export function buildFeaturesEmbed(
  added: GuildFeature[],
  removed: GuildFeature[],
  newGuild: Guild,
  executor: User | null,
  language: string,
  t: TFunction<"loggers", "guildEvents">,
) {
  const tFeat = newGuild.client.i18next.getFixedT(language, "guild-features");

  const description = [
    added.length
      ? `**${t(($) => $.guildUpdate.featuresChange.embed.added)}** ${added.map((f) => `\`${tFeat(($) => $[f])}\``).join(", ")}`
      : null,
    removed.length
      ? `**${t(($) => $.guildUpdate.featuresChange.embed.removed)}** ${removed.map((f) => `\`${tFeat(($) => $[f])}\``).join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.featuresChange.embed.title))
    .setDescription(description);
}

export function buildIconEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.iconChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.iconChange.embed.description, {
        old_icon: oldGuild.icon ? `${oldGuild.iconURL()}` : t(($) => $.none),
        new_icon: newGuild.icon ? `${newGuild.iconURL()}` : t(($) => $.none),
      }),
    );
}

export function buildMfaLevelEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.mfaLevelChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.mfaLevelChange.embed.description, {
        old_level: t(($) => $.mfaLevels[oldGuild.mfaLevel]),
        new_level: t(($) => $.mfaLevels[newGuild.mfaLevel]),
      }),
    );
}

export function buildNameEmbed(
  oldName: string,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.nameChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.nameChange.embed.description, {
        old_name: oldName,
        new_name: newGuild.name,
      }),
    );
}

export function buildDescriptionEmbed(
  oldDescription: string | null,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.descriptionChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.descriptionChange.embed.description, {
        old_description: oldDescription || t(($) => $.none),
        new_description: newGuild.description || t(($) => $.none),
      }),
    );
}

export function buildOwnerEmbed(
  oldOwnerId: string,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.ownerChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.ownerChange.embed.description, {
        old_owner: `<@${oldOwnerId}> (${oldOwnerId})`,
        new_owner: `<@${newGuild.ownerId}> (${newGuild.ownerId})`,
      }),
    );
}

export function buildPartneredEmbed(
  oldPartnered: boolean,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  const confirm = newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format;
  const reject = newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format;

  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.partneredChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.partneredChange.embed.description, {
        old_status: oldPartnered ? confirm : reject,
        new_status: newGuild.partnered ? confirm : reject,
      }),
    );
}

export function buildPreferredLocaleEmbed(
  oldLocale: Locale,
  newGuild: Guild,
  executor: User | null,
  language: string,
  t: TFunction<"loggers", "guildEvents">,
) {
  const tLocale = newGuild.client.i18next.getFixedT(language, "locales");
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.preferredLocaleChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.preferredLocaleChange.embed.description, {
        // We cast to never since TFunction doesn't know about our Locale type
        old_locale: tLocale(oldLocale as never),
        new_locale: tLocale(newGuild.preferredLocale as never),
      }),
    );
}

export function buildPremiumProgressBarEmbed(
  oldState: boolean,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  const confirm = newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format;
  const reject = newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format;

  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.premiumProgressBarChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.premiumProgressBarChange.embed.description, {
        old_progress_bar: oldState ? confirm : reject,
        new_progress_bar: newGuild.premiumProgressBarEnabled ? confirm : reject,
      }),
    );
}

export function buildPremiumSubscriptionCountEmbed(
  oldCount: number | null,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.premiumSubscriptionCountChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.premiumSubscriptionCountChange.embed.description, {
        old_count: oldCount ?? 0,
        new_count: newGuild.premiumSubscriptionCount ?? 0,
      }),
    );
}

export function buildPremiumTierEmbed(
  oldTier: number,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.premiumTierChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.premiumTierChange.embed.description, {
        old_level: oldTier,
        new_level: newGuild.premiumTier,
      }),
    );
}

export function buildPublicUpdatesChannelEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.publicUpdatesChannelChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.publicUpdatesChannelChange.embed.description, {
        old_channel: oldGuild.publicUpdatesChannelId ? `<#${oldGuild.publicUpdatesChannelId}>` : t(($) => $.none),
        new_channel: newGuild.publicUpdatesChannelId ? `<#${newGuild.publicUpdatesChannelId}>` : t(($) => $.none),
      }),
    );
}

export function buildRulesChannelEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.rulesChannelChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.rulesChannelChange.embed.description, {
        old_channel: oldGuild.rulesChannelId ? `<#${oldGuild.rulesChannelId}>` : t(($) => $.none),
        new_channel: newGuild.rulesChannelId ? `<#${newGuild.rulesChannelId}>` : t(($) => $.none),
      }),
    );
}

export function buildSafetyAlertsChannelEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.safetyAlertsChannelChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.safetyAlertsChannelChange.embed.description, {
        old_channel: oldGuild.safetyAlertsChannelId ? `<#${oldGuild.safetyAlertsChannelId}>` : t(($) => $.none),
        new_channel: newGuild.safetyAlertsChannelId ? `<#${newGuild.safetyAlertsChannelId}>` : t(($) => $.none),
      }),
    );
}

export function buildSplashEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.splashChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.splashChange.embed.description, {
        old_splash: oldGuild.splash ? `${oldGuild.splashURL()}` : t(($) => $.none),
        new_splash: newGuild.splash ? `${newGuild.splashURL()}` : t(($) => $.none),
      }),
    );
}

export function buildSystemChannelEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.systemChannelChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.systemChannelChange.embed.description, {
        old_channel: oldGuild.systemChannelId ? `<#${oldGuild.systemChannelId}>` : t(($) => $.none),
        new_channel: newGuild.systemChannelId ? `<#${newGuild.systemChannelId}>` : t(($) => $.none),
      }),
    );
}

export function buildVanityUrlEmbed(
  oldCode: string | null,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.vanityUrlCodeChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.vanityUrlCodeChange.embed.description, {
        old_code: oldCode ?? t(($) => $.none),
        new_code: newGuild.vanityURLCode ?? t(($) => $.none),
      }),
    );
}

export function buildVerificationLevelEmbed(
  oldLevel: GuildVerificationLevel,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.verificationLevelChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.verificationLevelChange.embed.description, {
        old_level: t(($) => $.verificationLevels[oldLevel]),
        new_level: t(($) => $.verificationLevels[newGuild.verificationLevel]),
      }),
    );
}

export function buildVerifiedEmbed(
  oldVerified: boolean,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  const confirm = newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format;
  const reject = newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format;

  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.verifiedChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.verifiedChange.embed.description, {
        old_status: oldVerified ? confirm : reject,
        new_status: newGuild.verified ? confirm : reject,
      }),
    );
}

export function buildWidgetChannelEmbed(
  oldGuild: Guild,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.widgetChannelChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.widgetChannelChange.embed.description, {
        old_channel: oldGuild.widgetChannelId ? `<#${oldGuild.widgetChannelId}>` : t(($) => $.none),
        new_channel: newGuild.widgetChannelId ? `<#${newGuild.widgetChannelId}>` : t(($) => $.none),
      }),
    );
}

export function buildSystemChannelFlagsEmbed(
  oldFlags: Readonly<SystemChannelFlagsBitField>,
  newGuild: Guild,
  executor: User | null,
  language: string,
  t: TFunction<"loggers", "guildEvents">,
) {
  const tFlags = newGuild.client.i18next.getFixedT(language, "system-channel-flags");
  // Helper to format the flags into a readable string list (e.g. "SuppressJoinNotifications")
  const formatFlags = (flags: Readonly<SystemChannelFlagsBitField>) => {
    const flagArray = flags.toArray();

    return flagArray.length ? flagArray.map((f) => `\`${tFlags(($) => $[f])}\``).join(", ") : t(($) => $.none);
  };

  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.systemChannelFlagsChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.systemChannelFlagsChange.embed.description, {
        old_flags: formatFlags(oldFlags),
        new_flags: formatFlags(newGuild.systemChannelFlags),
      }),
    );
}

export function buildNsfwLevelEmbed(
  oldLevel: GuildNSFWLevel,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.nsfwLevelChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.nsfwLevelChange.embed.description, {
        // You will need to add an 'nsfwLevels' array/object to your translation file
        // 0: Default, 1: Explicit, 2: Safe, 3: Age Restricted
        old_level: t(($) => $.nsfwLevels[oldLevel]),
        new_level: t(($) => $.nsfwLevels[newGuild.nsfwLevel]),
      }),
    );
}

export function buildWidgetEnabledEmbed(
  oldState: boolean | null,
  newGuild: Guild,
  executor: User | null,
  t: TFunction<"loggers", "guildEvents">,
) {
  const confirm = newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format;
  const reject = newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format;

  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t(($) => $.guildUpdate.widgetEnabledChange.embed.title))
    .setDescription(
      t(($) => $.guildUpdate.widgetEnabledChange.embed.description, {
        old_status: oldState ? confirm : reject,
        new_status: newGuild.widgetEnabled ? confirm : reject,
      }),
    );
}
