import { EventBase } from "src/types/index.js";
import { ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.GuildScheduledEventUserAdd,
  once: false,
  async execute(event, user) {
    if (!event.guild) return;
    if (user.partial) user = await user.fetch();
    const guildConfig = await getGuildConfig(event.guild.id);
    if (!guildConfig) return;
    const t = event.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventUserAdd");
    if (!guildConfig.event_logs_channel_id) return;
    const logChannel = event.guild.channels.cache.get(toStringId(guildConfig.event_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
          event,
          user,
        }),
      )
      .setTimestamp()
      .setThumbnail(user.displayAvatarURL() ?? event.coverImageURL() ?? event.guild.iconURL());
    const webhook = await returnWebhook(event.client, logChannel, event.guild.id, {
      id: guildConfig.event_logs_webhook_id,
      type: WebhookType.EVENT_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildScheduledEventUserAdd embed in ${event.guild?.name} (${event.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildScheduledEventUserAdd>;
