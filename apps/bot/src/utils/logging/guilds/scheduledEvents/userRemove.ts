import { ChannelType, EmbedBuilder, GuildScheduledEvent, User } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logScheduledEventUserRemove(event: GuildScheduledEvent, user: User, guildConfig: GuildWithLogs) {
  if (!event.guild) return;
  if (!guildConfig.logConfig?.eventLogsChannelId) return;
  const logChannel = event.guild.channels.cache.get(guildConfig.logConfig.eventLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const t = event.client.i18next.getFixedT(guildConfig.language, "loggers", "guildScheduledEvents");
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(t(($) => $.guildScheduledEventUserRemove.embed.title))
    .setDescription(
      t(($) => $.guildScheduledEventUserRemove.embed.description, {
        event,
        user,
      }),
    )
    .setTimestamp()
    .setThumbnail(user.displayAvatarURL() ?? event.coverImageURL() ?? event.guild.iconURL());
  const webhook = await returnWebhook(event.client, logChannel, event.guild.id, guildConfig, {
    id: guildConfig.logConfig?.eventLogsWebhookId,
    type: WebhookType.EVENT_LOGS,
  });
  if (!webhook) return;
  await webhook.send({ embeds: [embed] }).catch((error) => {
    logger.log({
      level: "error",
      error,
      message: `Failed to send guildScheduledEventUserRemove embed in ${event.guild?.name} (${event.guild?.id})`,
      channelId: logChannel.id,
    });
  });
}
