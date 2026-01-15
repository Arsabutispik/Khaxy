import {
  ChannelType,
  EmbedBuilder,
  GuildScheduledEventEntityType,
  time,
  TimestampStyles,
} from "discord.js";
import { returnWebhook, WebhookType, GuildScheduledEvents } from "@utils";
import { logger } from "@lib";

export async function logScheduledEventDelete({ event, executor, guildConfig, t }: GuildScheduledEvents) {
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
  if (event.entityType === GuildScheduledEventEntityType.External) {
    embed
      .setColor("Red")
      .setTitle(t(($) => $.external_channel.embed.title))
      .setDescription(
        t(($) => $.external_channel.embed.description, {
          event: event,
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
      .setTitle(t(($) => $.voice_channel.embed.title))
      .setDescription(
        t(($) => $.voice_channel.embed.description, {
          event: event,
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
