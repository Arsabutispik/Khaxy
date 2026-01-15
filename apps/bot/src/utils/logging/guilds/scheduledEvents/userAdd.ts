import { ChannelType, EmbedBuilder, GuildScheduledEvent, PartialGuildScheduledEvent, User } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { TFunction } from "i18next";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logScheduledEventUserAdd(
  event: GuildScheduledEvent | PartialGuildScheduledEvent,
  user: User,
  guildConfig: GuildWithLogs,
  t: TFunction,
) {
  if (!event.guild) return;
  if (!guildConfig.logConfig?.eventLogsChannelId) return;
  const logChannel = event.guild.channels.cache.get(guildConfig.logConfig?.eventLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle(t(($) => $.embed.title))
    .setDescription(
      t(($) => $.embed.description, {
        event,
        user,
      }),
    )
    .setTimestamp()
    .setThumbnail(user.displayAvatarURL() ?? event.coverImageURL() ?? event.guild.iconURL());
  const webhook = await returnWebhook(event.client, logChannel, event.guild.id, guildConfig, {
    id: guildConfig.logConfig.eventLogsWebhookId,
    type: WebhookType.EVENT_LOGS,
  });
  if (!webhook) return;
  await webhook.send({ embeds: [embed] }).catch((error) => {
    logger.log({
      level: "error",
      error,
      message: `Failed to send guildScheduledEventUserAdd embed in ${event.guild?.name} (${event.guild?.id})`,
      channelId: logChannel.id,
    });
  });
}
