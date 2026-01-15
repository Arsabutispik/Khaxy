import { ChannelType, EmbedBuilder, GuildScheduledEvent, time, TimestampStyles } from "discord.js";
import { returnWebhook, WebhookType, GuildScheduledEvents } from "@utils";
import { logger } from "@lib";

export async function logScheduledEventUpdate({
  event: oldEvent,
  newEvent,
  executor,
  guildConfig,
  t,
}: GuildScheduledEvents & { newEvent: GuildScheduledEvent }) {
  if (!newEvent.guild) return;
  if (!guildConfig.logConfig?.eventLogsChannelId) return;
  const logChannel = newEvent.guild.channels.cache.get(guildConfig.logConfig?.eventLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embeds = [];
  const embed = new EmbedBuilder()
    .setColor("Yellow")
    .setTimestamp()
    .setThumbnail(newEvent.coverImageURL() ?? newEvent.guild.iconURL());
  if (executor) {
    if (executor.partial) executor = await executor.fetch();
    embed.setFooter({
      text: executor.tag,
      iconURL: executor.displayAvatarURL(),
    });
  }
  if (oldEvent.entityMetadata?.location !== newEvent.entityMetadata?.location) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.location_change.embed.title))
      .setDescription(
        t(($) => $.location_change.embed.title, {
          event: newEvent,
          old_location: oldEvent.entityMetadata?.location,
          new_location: oldEvent.entityMetadata?.location,
        }),
      );
    embeds.push(embedClone);
  }
  if (oldEvent.description !== newEvent.description) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.description_change.embed.title))
      .setDescription(
        t(($) => $.description_change.embed.description, {
          event: newEvent,
          old_description: oldEvent.description,
          new_description: newEvent.description,
        }),
      );
    embeds.push(embedClone);
  }
  if (oldEvent.name !== newEvent.name) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.name_change.embed.title))
      .setDescription(
        t(($) => $.name_change.embed.description, {
          event: newEvent,
          old_name: oldEvent.name,
          new_name: newEvent.name,
        }),
      );
    embeds.push(embedClone);
  }
  if (oldEvent.scheduledStartAt !== newEvent.scheduledStartAt) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.start_time_change.embed.title))
      .setDescription(
        t(($) => $.start_time_change.embed.description, {
          event: newEvent,
          old_start_time: time(newEvent.scheduledStartAt!, TimestampStyles.FullDateShortTime),
          new_start_time: time(newEvent.scheduledStartAt!, TimestampStyles.FullDateShortTime),
        }),
      );
    embeds.push(embedClone);
  }
  if (oldEvent.scheduledEndAt !== newEvent.scheduledEndAt) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.end_time_change.embed.title))
      .setDescription(
        t(($) => $.end_time_change.embed.description, {
          event: newEvent,
          old_end_time: time(oldEvent.scheduledEndAt!, TimestampStyles.FullDateShortTime),
          new_end_time: time(newEvent.scheduledEndAt!, TimestampStyles.FullDateShortTime),
        }),
      );
    embeds.push(embedClone);
  }
  if (oldEvent.status !== newEvent.status) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.status_change.embed.title))
      .setDescription(
        t(($) => $.status_change.embed.description, {
          event: newEvent,
          old_status: t(`status_change.status.${oldEvent.status}`),
          new_status: t(($) => $.status_change.status.${newEvent.status}),
        }),
      );
    embeds.push(embedClone);
  }
  if (oldEvent.coverImageURL() !== newEvent.coverImageURL()) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.image_change.embed.title))
      .setDescription(
        t(($) => $.image_change.embed.description, {
          event: newEvent,
          old_image_url: newEvent.coverImageURL(),
          new_image_url: newEvent.coverImageURL(),
        }),
      );
    embeds.push(embedClone);
  }
  if (embeds.length > 0) {
    const webhook = await returnWebhook(newEvent.client, logChannel, newEvent.guild.id, guildConfig, {
      id: guildConfig.logConfig.eventLogsWebhookId,
      type: WebhookType.EVENT_LOGS,
    });
    if (!webhook) return;
    await webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildScheduledEventUpdate embed in ${newEvent.guild?.name} (${newEvent.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  }
}
