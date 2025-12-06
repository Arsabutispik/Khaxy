import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { EventBase } from "src/types/index.js";
import { getGuildConfig } from "src/database/index.js";
import { formatDuration, returnWebhook, toStringId, WebhookType } from "src/utils/index.js";
import dayjs from "dayjs";
import { logger } from "src/lib/index.js";
import { isDeepStrictEqual } from "node:util";

export default {
  name: Events.GuildUpdate,
  once: false,
  async execute(oldGuild, newGuild) {
    const guildConfig = await getGuildConfig(newGuild.id);
    if (!guildConfig) return;
    const logsChannel = newGuild.channels.cache.get(toStringId(guildConfig.guild_logs_channel_id));
    if (logsChannel?.type !== ChannelType.GuildText) return;
    const auditLogs = await newGuild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.GuildUpdate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    if (logEntry?.executor?.id === newGuild.client.user.id) return;
    const webhook = await returnWebhook(newGuild.client, logsChannel, newGuild.id, {
      id: guildConfig.guild_logs_webhook_id,
      type: WebhookType.GUILD_LOGS,
    });
    const t = newGuild.client.i18next.getFixedT(guildConfig.language, "events", "guildUpdate");
    const embed = new EmbedBuilder().setColor("Yellow").setTimestamp().setThumbnail(newGuild.iconURL());
    const embeds: Array<EmbedBuilder> = [];
    if (logEntry?.executor && dayjs().diff(logEntry.createdAt, "seconds") < 3) {
      embed.setFooter({
        text: logEntry.executor.tag || t("unknown_executor"),
        iconURL: logEntry.executor.displayAvatarURL(),
      });
    }
    if (oldGuild.afkChannel?.id !== newGuild.afkChannel?.id) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("afk_channel_change.embed.title"))
        .setDescription(
          t("afk_channel_change.embed.description", {
            old_channel: oldGuild.afkChannel ? `<#${oldGuild.afkChannel.id}>` : t("none"),
            new_channel: newGuild.afkChannel ? `<#${newGuild.afkChannel.id}>` : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("afk_timeout_change.embed.title"))
        .setDescription(
          t("afk_timeout_change.embed.description", {
            old_afk_timeout: formatDuration(oldGuild.afkTimeout * 1000, guildConfig.language),
            new_afk_timeout: formatDuration(newGuild.afkTimeout * 1000, guildConfig.language),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.banner !== newGuild.banner) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("banner_change.embed.title"))
        .setDescription(
          t("banner_change.embed.description", {
            old_banner: oldGuild.banner ? `${oldGuild.bannerURL()}` : t("none"),
            new_banner: newGuild.banner ? `${newGuild.bannerURL()}` : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.defaultMessageNotifications !== newGuild.defaultMessageNotifications) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("default_message_notifications_change.embed.title"))
        .setDescription(
          t("default_message_notifications_change.embed.description", {
            old_level: t(`notification_levels.${oldGuild.defaultMessageNotifications}`),
            new_level: t(`notification_levels.${newGuild.defaultMessageNotifications}`),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.discoverySplash !== newGuild.discoverySplash) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("discovery_splash_change.embed.title"))
        .setDescription(
          t("discovery_splash_change.embed.description", {
            old_discovery_splash: oldGuild.discoverySplash ? `${oldGuild.discoverySplashURL()}` : t("none"),
            new_discovery_splash: newGuild.discoverySplash ? `${newGuild.discoverySplashURL()}` : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.explicitContentFilter !== newGuild.explicitContentFilter) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("explicit_content_filter_change.embed.title"))
        .setDescription(
          t("explicit_content_filter_change.embed.description", {
            old_level: t(`explicit_content_filter_levels.${oldGuild.explicitContentFilter}`),
            new_level: t(`explicit_content_filter_levels.${newGuild.explicitContentFilter}`),
          }),
        );
      embeds.push(embedClone);
    }
    if (!isDeepStrictEqual(oldGuild.features, newGuild.features)) {
      const removed = oldGuild.features.filter((f) => !newGuild.features.includes(f));
      const added = newGuild.features.filter((f) => !oldGuild.features.includes(f));
      const tFeat = newGuild.client.i18next.getFixedT(guildConfig.language, "guild-features");
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("features_change.embed.title"))
        .setDescription(
          [
            added.length
              ? `**${t("features_change.embed.added")}** ${added.map((f) => `\`${tFeat(`${f}`, f)}\``).join(", ")}`
              : null,
            removed.length
              ? `**${t("features_change.embed.removed")}** ${removed.map((f) => `\`${t(`${f}`, f)}\``).join(", ")}`
              : null,
          ]
            .filter(Boolean)
            .join("\n"),
        );

      embeds.push(embedClone);
    }
    if (oldGuild.icon !== newGuild.icon) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("icon_change.embed.title"))
        .setDescription(
          t("icon_change.embed.description", {
            old_icon: oldGuild.icon ? `${oldGuild.iconURL()}` : t("none"),
            new_icon: newGuild.icon ? `${newGuild.iconURL()}` : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.mfaLevel !== newGuild.mfaLevel) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("mfa_level_change.embed.title"))
        .setDescription(
          t("mfa_level_change.embed.description", {
            old_level: t(`mfa_levels.${oldGuild.mfaLevel}`),
            new_level: t(`mfa_levels.${newGuild.mfaLevel}`),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.name !== newGuild.name) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("name_change.embed.title"))
        .setDescription(
          t("name_change.embed.description", {
            old_name: oldGuild.name,
            new_name: newGuild.name,
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.description !== newGuild.description) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("description_change.embed.title"))
        .setDescription(
          t("description_change.embed.description", {
            old_description: oldGuild.description ? oldGuild.description : t("none"),
            new_description: newGuild.description ? newGuild.description : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.ownerId !== newGuild.ownerId) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("owner_change.embed.title"))
        .setDescription(
          t("owner_change.embed.description", {
            old_owner: `<@${oldGuild.ownerId}> (${oldGuild.ownerId})`,
            new_owner: `<@${newGuild.ownerId}> (${newGuild.ownerId})`,
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.partnered !== newGuild.partnered) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("partnered_change.embed.title"))
        .setDescription(
          t("partnered_change.embed.description", {
            old_partnered: oldGuild.partnered
              ? newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format
              : newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format,
            new_partnered: newGuild.partnered
              ? newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format
              : newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format,
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.preferredLocale !== newGuild.preferredLocale) {
      const tLocale = newGuild.client.i18next.getFixedT(guildConfig.language, "locales");
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("preferred_locale_change.embed.title"))
        .setDescription(
          t("preferred_locale_change.embed.description", {
            old_locale: tLocale(oldGuild.preferredLocale),
            new_locale: tLocale(newGuild.preferredLocale),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.premiumProgressBarEnabled !== newGuild.premiumProgressBarEnabled) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("premium_progress_bar_change.embed.title"))
        .setDescription(
          t("premium_progress_bar_change.embed.description", {
            old_progress_bar: oldGuild.premiumProgressBarEnabled
              ? newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format
              : newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format,
            new_progress_bar: newGuild.premiumProgressBarEnabled
              ? newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format
              : newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format,
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.premiumSubscriptionCount !== newGuild.premiumSubscriptionCount) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("premium_subscription_count_change.embed.title"))
        .setDescription(
          t("premium_subscription_count_change.embed.description", {
            old_count: oldGuild.premiumSubscriptionCount ?? 0,
            new_count: newGuild.premiumSubscriptionCount ?? 0,
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.premiumTier !== newGuild.premiumTier) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("premium_tier_change.embed.title"))
        .setDescription(
          t("premium_tier_change.embed.description", {
            old_tier: oldGuild.premiumTier,
            new_tier: newGuild.premiumTier,
          }),
        );
      embeds.push(embedClone);
    }

    if (oldGuild.publicUpdatesChannelId !== newGuild.publicUpdatesChannelId) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("public_updates_channel_change.embed.title"))
        .setDescription(
          t("public_updates_channel_change.embed.description", {
            old_channel: oldGuild.publicUpdatesChannelId ? `<#${oldGuild.publicUpdatesChannelId}>` : t("none"),
            new_channel: newGuild.publicUpdatesChannelId ? `<#${newGuild.publicUpdatesChannelId}>` : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.rulesChannelId !== newGuild.rulesChannelId) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("rules_channel_change.embed.title"))
        .setDescription(
          t("rules_channel_change.embed.description", {
            old_channel: oldGuild.rulesChannelId ? `<#${oldGuild.rulesChannelId}>` : t("none"),
            new_channel: newGuild.rulesChannelId ? `<#${newGuild.rulesChannelId}>` : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.safetyAlertsChannelId !== newGuild.safetyAlertsChannelId) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("safety_alerts_channel_change.embed.title"))
        .setDescription(
          t("safety_alerts_channel_change.embed.description", {
            old_channel: oldGuild.safetyAlertsChannelId ? `<#${oldGuild.safetyAlertsChannelId}>` : t("none"),
            new_channel: newGuild.safetyAlertsChannelId ? `<#${newGuild.safetyAlertsChannelId}>` : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.splash !== newGuild.splash) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("splash_change.embed.title"))
        .setDescription(
          t("splash_change.embed.description", {
            old_splash: oldGuild.splash ? `${oldGuild.splashURL()}` : t("none"),
            new_splash: newGuild.splash ? `${newGuild.splashURL()}` : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.systemChannelId !== newGuild.systemChannelId) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("system_channel_change.embed.title"))
        .setDescription(
          t("system_channel_change.embed.description", {
            old_channel: oldGuild.systemChannelId ? `<#${oldGuild.systemChannelId}>` : t("none"),
            new_channel: newGuild.systemChannelId ? `<#${newGuild.systemChannelId}>` : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("vanity_url_code_change.embed.title"))
        .setDescription(
          t("vanity_url_code_change.embed.description", {
            old_code: oldGuild.vanityURLCode ?? t("none"),
            new_code: newGuild.vanityURLCode ?? t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("verification_level_change.embed.title"))
        .setDescription(
          t("verification_level_change.embed.description", {
            old_level: t(`verification_levels.${oldGuild.verificationLevel}`),
            new_level: t(`verification_levels.${newGuild.verificationLevel}`),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.verified !== newGuild.verified) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("verified_change.embed.title"))
        .setDescription(
          t("verified_change.embed.description", {
            old_verified: oldGuild.verified
              ? newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format
              : newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format,
            new_verified: newGuild.verified
              ? newGuild.client.allEmojis.get(newGuild.client.config.emojis.confirm.id)?.format
              : newGuild.client.allEmojis.get(newGuild.client.config.emojis.reject.id)?.format,
          }),
        );
      embeds.push(embedClone);
    }
    if (oldGuild.widgetChannelId !== newGuild.widgetChannelId) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("widget_channel_change.embed.title"))
        .setDescription(
          t("widget_channel_change.embed.description", {
            old_channel: oldGuild.widgetChannelId ? `<#${oldGuild.widgetChannelId}>` : t("none"),
            new_channel: newGuild.widgetChannelId ? `<#${newGuild.widgetChannelId}>` : t("none"),
          }),
        );
      embeds.push(embedClone);
    }
    await webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildUpdate embed in ${newGuild.name} (${newGuild.id})`,
        channelId: logsChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildUpdate>;
