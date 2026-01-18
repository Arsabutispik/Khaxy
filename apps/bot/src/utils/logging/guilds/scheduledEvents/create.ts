import { ChannelType, EmbedBuilder, GuildScheduledEventEntityType, time, TimestampStyles } from "discord.js";
import { returnWebhook, WebhookType, GuildScheduledEvents } from "@utils";
import { logger } from "@lib";

export async function logScheduledEventCreate({ event, executor, guildConfig }: GuildScheduledEvents) {
  if (!event.guild) return;
  if (!guildConfig.logConfig?.eventLogsChannelId) return;
  const logChannel = event.guild.channels.cache.get(guildConfig.logConfig.eventLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const t = event.client.i18next.getFixedT(guildConfig.language, "loggers", "guildScheduledEvents");
  const embed = new EmbedBuilder()
    .setTimestamp()
    .setThumbnail(event.coverImageURL() ?? event.guild.iconURL())
    .setFooter({
      text: executor?.tag || t(($) => $.unknownExecutor),
      iconURL: executor?.displayAvatarURL() || undefined,
    });
  if (event.entityType === GuildScheduledEventEntityType.External) {
    embed
      .setColor("Green")
      .setTitle(t(($) => $.guildScheduledEventCreate.externalChannel.embed.title))
      .setDescription(
        t(($) => $.guildScheduledEventCreate.externalChannel.embed.description, {
          event: {
            name: event.name,
            id: event.id,
            description: event.description || "No description", // Handle null description
            entityMetadata: {
              location: event.entityMetadata?.location || "Unknown Location", // Handle null metadata
            },
          },
          scheduled_start_time: event.scheduledStartAt
            ? time(event.scheduledStartAt, TimestampStyles.FullDateShortTime)
            : "N/A",
          scheduled_end_time: event.scheduledEndAt
            ? time(event.scheduledEndAt, TimestampStyles.FullDateShortTime)
            : "N/A",
        }),
      );
  } else {
    embed
      .setColor("Green")
      .setTitle(t(($) => $.guildScheduledEventCreate.voiceChannel.embed.title))
      .setDescription(
        t(($) => $.guildScheduledEventCreate.voiceChannel.embed.description, {
          event: {
            name: event.name,
            id: event.id,
            description: event.description || "No description",
            channel: {
              name: event.channel?.name || "Unknown Channel",
              id: event.channelId,
            },
          },
          scheduled_start_time: event.scheduledStartAt
            ? time(event.scheduledStartAt, TimestampStyles.FullDateShortTime)
            : "N/A",
        }),
      );
  }
  const webhook = await returnWebhook(event.client, logChannel, event.guild.id, guildConfig, {
    id: guildConfig.logConfig.eventLogsWebhookId,
    type: WebhookType.EVENT_LOGS,
  });
  if (!webhook) return;
  await webhook.send({ embeds: [embed] }).catch((error) => {
    logger.log({
      level: "error",
      error,
      message: `Failed to send guildScheduledEventCreate embed in ${event.guild?.name} (${event.guild?.id})`,
      channelId: logChannel.id,
    });
  });
}
