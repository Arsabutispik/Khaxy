import { EventBase } from "src/types/index.js";
import { ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.GuildScheduledEventUpdate,
  once: false,
  async execute(oldEvent, newEvent) {
    if (!newEvent.guild) return;
    if (oldEvent?.partial) {
      oldEvent = await oldEvent.fetch().catch(() => null);
    }
    if (!oldEvent) return;
    const guildConfig = await getGuildConfig(newEvent.guild.id);
    if (!guildConfig) return;
    const t = newEvent.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventUpdate");
    if (!guildConfig.event_logs_channel_id) return;
    const logChannel = newEvent.guild.channels.cache.get(toStringId(guildConfig.event_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embeds = [];
    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTimestamp()
      .setThumbnail(newEvent.coverImageURL() ?? newEvent.guild.iconURL());
    if (newEvent.creator) {
      embed.setFooter({
        text: newEvent.creator.tag,
        iconURL: newEvent.creator.displayAvatarURL(),
      });
    }
    if (oldEvent.entityMetadata?.location !== newEvent.entityMetadata?.location) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("location_change.embed.title"))
        .setDescription(
          t("location_change.embed.title", {
            event: newEvent,
            old_location: oldEvent.entityMetadata?.location,
            new_location: oldEvent.entityMetadata?.location,
          }),
        );
      embeds.push(embedClone);
    }
    if (oldEvent.description !== newEvent.description) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("description_change.embed.title"))
        .setDescription(
          t("description_change.embed.description", {
            event: newEvent,
            old_description: oldEvent.description,
            new_description: newEvent.description,
          }),
        );
      embeds.push(embedClone);
    }
    if (oldEvent.name !== newEvent.name) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("name_change.embed.title"))
        .setDescription(
          t("name_change.embed.description", {
            event: newEvent,
            old_name: oldEvent.name,
            new_name: newEvent.name,
          }),
        );
      embeds.push(embedClone);
    }
    if (oldEvent.scheduledStartAt !== newEvent.scheduledStartAt) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("start_time_change.embed.title"))
        .setDescription(
          t("start_time_change.embed.description", {
            event: newEvent,
            old_start_time: time(newEvent.scheduledStartAt!, TimestampStyles.LongDateTime),
            new_start_time: time(newEvent.scheduledStartAt!, TimestampStyles.LongDateTime),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldEvent.scheduledEndAt !== newEvent.scheduledEndAt) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("end_time_change.embed.title"))
        .setDescription(
          t("end_time_change.embed.description", {
            event: newEvent,
            old_end_time: time(oldEvent.scheduledEndAt!, TimestampStyles.LongDateTime),
            new_end_time: time(newEvent.scheduledEndAt!, TimestampStyles.LongDateTime),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldEvent.status !== newEvent.status) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("status_change.embed.title"))
        .setDescription(
          t("status_change.embed.description", {
            event: newEvent,
            old_status: t(`status_change.status.${oldEvent.status}`),
            new_status: t(`status_change.status.${newEvent.status}`),
          }),
        );
      embeds.push(embedClone);
    }
    if (oldEvent.coverImageURL() !== newEvent.coverImageURL()) {
      const embedClone = EmbedBuilder.from(embed)
        .setTitle(t("image_change.embed.title"))
        .setDescription(
          t("image_change.embed.description", {
            event: newEvent,
            old_image_url: newEvent.coverImageURL(),
            new_image_url: newEvent.coverImageURL(),
          }),
        );
      embeds.push(embedClone);
    }
    if (embeds.length > 0) {
      const webhook = await returnWebhook(newEvent.client, logChannel, newEvent.guild.id, {
        id: guildConfig.event_logs_webhook_id,
        type: WebhookType.EVENT_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send guildScheduledEventUpdate embed in ${newEvent.guild?.name} (${newEvent.guild?.id})`,
          channelId: logChannel.id,
        });
      });
    }
  },
} satisfies EventBase<Events.GuildScheduledEventUpdate>;
