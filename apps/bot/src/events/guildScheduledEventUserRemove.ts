import { EventBase } from "src/types/index.js";
import { ChannelType, EmbedBuilder, Events, GuildScheduledEvent, User } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { returnWebhook, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";
import { GuildWithLogs } from "@repo/database";
import { TFunction } from "i18next";

export default {
  name: Events.GuildScheduledEventUserRemove,
  once: false,
  async execute(event, user) {
    if (user.partial) user = await user.fetch();
    if (event.partial) event = await event.fetch();
    if (!event.guild) return;
    const guildConfig = await getOrCreateGuild(event.guild.id);
    if (!guildConfig) return;
    const t = event.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventUserRemove");
    await logScheduledEventUserRemove(event, user, guildConfig, t);
  },
} satisfies EventBase<Events.GuildScheduledEventUserRemove>;

async function logScheduledEventUserRemove(
  event: GuildScheduledEvent,
  user: User,
  guildConfig: GuildWithLogs,
  t: TFunction,
) {
  if (!event.guild) return;
  if (!guildConfig.logConfig?.eventLogsChannelId) return;
  const logChannel = event.guild.channels.cache.get(guildConfig.logConfig.eventLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(t("embed.title"))
    .setDescription(
      t("embed.description", {
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
