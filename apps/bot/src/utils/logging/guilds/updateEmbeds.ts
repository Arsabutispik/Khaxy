import { EmbedBuilder, Guild, User } from "discord.js";
import { TFunction } from "i18next";
import { formatDuration } from "@utils";

// ============================================================================
// BASE HELPER
// ============================================================================

function createBaseEmbed(guild: Guild, executor: User | null, t: TFunction) {
  const embed = new EmbedBuilder().setColor("Yellow").setTimestamp().setThumbnail(guild.iconURL());

  if (executor) {
    embed.setFooter({
      text: executor.tag || t("unknown_executor"),
      iconURL: executor.displayAvatarURL(),
    });
  }

  return embed;
}

// ============================================================================
// PROPERTY BUILDERS
// ============================================================================

export function buildAfkChannelEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("afk_channel_change.embed.title"))
    .setDescription(
      t("afk_channel_change.embed.description", {
        old_channel: oldGuild.afkChannel ? `<#${oldGuild.afkChannel.id}>` : t("none"),
        new_channel: newGuild.afkChannel ? `<#${newGuild.afkChannel.id}>` : t("none"),
      }),
    );
}

export function buildAfkTimeoutEmbed(
  oldTimeout: number,
  newGuild: Guild,
  executor: User | null,
  language: string,
  t: TFunction,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("afk_timeout_change.embed.title"))
    .setDescription(
      t("afk_timeout_change.embed.description", {
        old_afk_timeout: formatDuration(oldTimeout * 1000, language),
        new_afk_timeout: formatDuration(newGuild.afkTimeout * 1000, language),
      }),
    );
}

export function buildBannerEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("banner_change.embed.title"))
    .setDescription(
      t("banner_change.embed.description", {
        old_banner: oldGuild.banner ? `${oldGuild.bannerURL()}` : t("none"),
        new_banner: newGuild.banner ? `${newGuild.bannerURL()}` : t("none"),
      }),
    );
}

export function buildNotificationEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("default_message_notifications_change.embed.title"))
    .setDescription(
      t("default_message_notifications_change.embed.description", {
        old_level: t(`notification_levels.${oldGuild.defaultMessageNotifications}`),
        new_level: t(`notification_levels.${newGuild.defaultMessageNotifications}`),
      }),
    );
}

export function buildDiscoverySplashEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("discovery_splash_change.embed.title"))
    .setDescription(
      t("discovery_splash_change.embed.description", {
        old_discovery_splash: oldGuild.discoverySplash ? `${oldGuild.discoverySplashURL()}` : t("none"),
        new_discovery_splash: newGuild.discoverySplash ? `${newGuild.discoverySplashURL()}` : t("none"),
      }),
    );
}

export function buildExplicitContentFilterEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("explicit_content_filter_change.embed.title"))
    .setDescription(
      t("explicit_content_filter_change.embed.description", {
        old_level: t(`explicit_content_filter_levels.${oldGuild.explicitContentFilter}`),
        new_level: t(`explicit_content_filter_levels.${newGuild.explicitContentFilter}`),
      }),
    );
}

export function buildFeaturesEmbed(
  added: string[],
  removed: string[],
  newGuild: Guild,
  executor: User | null,
  language: string,
  t: TFunction,
) {
  const tFeat = newGuild.client.i18next.getFixedT(language, "guild-features");

  const description = [
    added.length
      ? `**${t("features_change.embed.added")}** ${added.map((f) => `\`${tFeat(`${f}`, f)}\``).join(", ")}`
      : null,
    removed.length
      ? `**${t("features_change.embed.removed")}** ${removed.map((f) => `\`${t(`${f}`, f)}\``).join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return createBaseEmbed(newGuild, executor, t).setTitle(t("features_change.embed.title")).setDescription(description);
}

export function buildIconEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("icon_change.embed.title"))
    .setDescription(
      t("icon_change.embed.description", {
        old_icon: oldGuild.icon ? `${oldGuild.iconURL()}` : t("none"),
        new_icon: newGuild.icon ? `${newGuild.iconURL()}` : t("none"),
      }),
    );
}

export function buildMfaLevelEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("mfa_level_change.embed.title"))
    .setDescription(
      t("mfa_level_change.embed.description", {
        old_level: t(`mfa_levels.${oldGuild.mfaLevel}`),
        new_level: t(`mfa_levels.${newGuild.mfaLevel}`),
      }),
    );
}

export function buildNameEmbed(oldName: string, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("name_change.embed.title"))
    .setDescription(
      t("name_change.embed.description", {
        old_name: oldName,
        new_name: newGuild.name,
      }),
    );
}

export function buildDescriptionEmbed(
  oldDescription: string | null,
  newGuild: Guild,
  executor: User | null,
  t: TFunction,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("description_change.embed.title"))
    .setDescription(
      t("description_change.embed.description", {
        old_description: oldDescription || t("none"),
        new_description: newGuild.description || t("none"),
      }),
    );
}

export function buildOwnerEmbed(oldOwnerId: string, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("owner_change.embed.title"))
    .setDescription(
      t("owner_change.embed.description", {
        old_owner: `<@${oldOwnerId}> (${oldOwnerId})`,
        new_owner: `<@${newGuild.ownerId}> (${newGuild.ownerId})`,
      }),
    );
}

export function buildPartneredEmbed(oldPartnered: boolean, newGuild: Guild, executor: User | null, t: TFunction) {
  const confirm = newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format;
  const reject = newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format;

  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("partnered_change.embed.title"))
    .setDescription(
      t("partnered_change.embed.description", {
        old_partnered: oldPartnered ? confirm : reject,
        new_partnered: newGuild.partnered ? confirm : reject,
      }),
    );
}

export function buildPreferredLocaleEmbed(
  oldLocale: string,
  newGuild: Guild,
  executor: User | null,
  language: string,
  t: TFunction,
) {
  const tLocale = newGuild.client.i18next.getFixedT(language, "locales");
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("preferred_locale_change.embed.title"))
    .setDescription(
      t("preferred_locale_change.embed.description", {
        old_locale: tLocale(oldLocale),
        new_locale: tLocale(newGuild.preferredLocale),
      }),
    );
}

export function buildPremiumProgressBarEmbed(oldState: boolean, newGuild: Guild, executor: User | null, t: TFunction) {
  const confirm = newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format;
  const reject = newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format;

  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("premium_progress_bar_change.embed.title"))
    .setDescription(
      t("premium_progress_bar_change.embed.description", {
        old_progress_bar: oldState ? confirm : reject,
        new_progress_bar: newGuild.premiumProgressBarEnabled ? confirm : reject,
      }),
    );
}

export function buildPremiumSubscriptionCountEmbed(
  oldCount: number | null,
  newGuild: Guild,
  executor: User | null,
  t: TFunction,
) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("premium_subscription_count_change.embed.title"))
    .setDescription(
      t("premium_subscription_count_change.embed.description", {
        old_count: oldCount ?? 0,
        new_count: newGuild.premiumSubscriptionCount ?? 0,
      }),
    );
}

export function buildPremiumTierEmbed(oldTier: number, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("premium_tier_change.embed.title"))
    .setDescription(
      t("premium_tier_change.embed.description", {
        old_tier: oldTier,
        new_tier: newGuild.premiumTier,
      }),
    );
}

export function buildPublicUpdatesChannelEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("public_updates_channel_change.embed.title"))
    .setDescription(
      t("public_updates_channel_change.embed.description", {
        old_channel: oldGuild.publicUpdatesChannelId ? `<#${oldGuild.publicUpdatesChannelId}>` : t("none"),
        new_channel: newGuild.publicUpdatesChannelId ? `<#${newGuild.publicUpdatesChannelId}>` : t("none"),
      }),
    );
}

export function buildRulesChannelEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("rules_channel_change.embed.title"))
    .setDescription(
      t("rules_channel_change.embed.description", {
        old_channel: oldGuild.rulesChannelId ? `<#${oldGuild.rulesChannelId}>` : t("none"),
        new_channel: newGuild.rulesChannelId ? `<#${newGuild.rulesChannelId}>` : t("none"),
      }),
    );
}

export function buildSafetyAlertsChannelEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("safety_alerts_channel_change.embed.title"))
    .setDescription(
      t("safety_alerts_channel_change.embed.description", {
        old_channel: oldGuild.safetyAlertsChannelId ? `<#${oldGuild.safetyAlertsChannelId}>` : t("none"),
        new_channel: newGuild.safetyAlertsChannelId ? `<#${newGuild.safetyAlertsChannelId}>` : t("none"),
      }),
    );
}

export function buildSplashEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("splash_change.embed.title"))
    .setDescription(
      t("splash_change.embed.description", {
        old_splash: oldGuild.splash ? `${oldGuild.splashURL()}` : t("none"),
        new_splash: newGuild.splash ? `${newGuild.splashURL()}` : t("none"),
      }),
    );
}

export function buildSystemChannelEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("system_channel_change.embed.title"))
    .setDescription(
      t("system_channel_change.embed.description", {
        old_channel: oldGuild.systemChannelId ? `<#${oldGuild.systemChannelId}>` : t("none"),
        new_channel: newGuild.systemChannelId ? `<#${newGuild.systemChannelId}>` : t("none"),
      }),
    );
}

export function buildVanityUrlEmbed(oldCode: string | null, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("vanity_url_code_change.embed.title"))
    .setDescription(
      t("vanity_url_code_change.embed.description", {
        old_code: oldCode ?? t("none"),
        new_code: newGuild.vanityURLCode ?? t("none"),
      }),
    );
}

export function buildVerificationLevelEmbed(oldLevel: number, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("verification_level_change.embed.title"))
    .setDescription(
      t("verification_level_change.embed.description", {
        old_level: t(`verification_levels.${oldLevel}`),
        new_level: t(`verification_levels.${newGuild.verificationLevel}`),
      }),
    );
}

export function buildVerifiedEmbed(oldVerified: boolean, newGuild: Guild, executor: User | null, t: TFunction) {
  const confirm = newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format;
  const reject = newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format;

  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("verified_change.embed.title"))
    .setDescription(
      t("verified_change.embed.description", {
        old_verified: oldVerified ? confirm : reject,
        new_verified: newGuild.verified ? confirm : reject,
      }),
    );
}

export function buildWidgetChannelEmbed(oldGuild: Guild, newGuild: Guild, executor: User | null, t: TFunction) {
  return createBaseEmbed(newGuild, executor, t)
    .setTitle(t("widget_channel_change.embed.title"))
    .setDescription(
      t("widget_channel_change.embed.description", {
        old_channel: oldGuild.widgetChannelId ? `<#${oldGuild.widgetChannelId}>` : t("none"),
        new_channel: newGuild.widgetChannelId ? `<#${newGuild.widgetChannelId}>` : t("none"),
      }),
    );
}
