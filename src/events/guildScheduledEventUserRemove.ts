import { EventBase } from "@customTypes";
import { ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildScheduledEventUserRemove,
  once: false,
  async execute(event, user) {
    if (!event.guild) return;
    if (user.partial) user = await user.fetch();
    const guildConfig = await getGuildConfig(event.guild.id);
    if (!guildConfig) return;
    const t = event.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventUserRemove");
    if (!guildConfig.event_logs_channel_id) return;
    const logChannel = event.guild.channels.cache.get(toStringId(guildConfig.event_logs_channel_id));
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
    const webhook = await returnWebhook(event.client, logChannel, event.guild.id, {
      id: guildConfig.event_logs_webhook_id,
      type: WebhookType.EVENT_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildScheduledEventUserRemove embed in ${event.guild?.name} (${event.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildScheduledEventUserRemove>;
