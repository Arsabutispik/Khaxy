import { ChannelType, EmbedBuilder, GuildScheduledEventEntityType, time, TimestampStyles } from "discord.js";
import { returnWebhook, WebhookType, GuildScheduledEvents } from "@utils";
import { logger } from "@lib";

export async function logScheduledEventDelete({ event, executor, guildConfig }: GuildScheduledEvents) {
  if (!event.guild) return;
  if (!guildConfig.logConfig?.eventLogsChannelId) return;
  const logChannel = event.guild.channels.cache.get(guildConfig.logConfig.eventLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder().setTimestamp().setThumbnail(event.coverImageURL() ?? event.guild.iconURL());
  if (executor) {
    if (executor.partial) executor = await executor.fetch();
    embed.setFooter({
      text: executor.username,
      iconURL: executor.displayAvatarURL(),
    });
  }
  const t = event.client.i18next.getFixedT(guildConfig.language, "loggers", "guildScheduledEvents");
  if (event.entityType === GuildScheduledEventEntityType.External) {
    embed
      .setColor("Red")
      .setTitle(t(($) => $.guildScheduledEventDelete.externalChannel.embed.title))
      .setDescription(
        t(($) => $.guildScheduledEventDelete.externalChannel.embed.description, {
          event: {
            name: event.name,
            id: event.id,
            description: event.description ?? t(($) => $.noDescription),
            entityType: event.entityType,
            entityMetadata: {
              location: event.entityMetadata?.location ?? t(($) => $.noLocation),
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
      .setColor("Red")
      .setTitle(t(($) => $.guildScheduledEventDelete.voiceChannel.embed.title))
      .setDescription(
        t(($) => $.guildScheduledEventDelete.voiceChannel.embed.description, {
          event: {
            name: event.name,
            id: event.id,
            description: event.description ?? t(($) => $.noDescription),
            entityType: event.entityType,
            channel: {
              name: event.channel?.name ?? t(($) => $.unknownChannel),
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
      message: `Failed to send guildScheduledEventDelete embed in ${event.guild?.name} (${event.guild?.id})`,
      channelId: logChannel.id,
    });
  });
}
