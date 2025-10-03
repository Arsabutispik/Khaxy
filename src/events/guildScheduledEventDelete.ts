import { EventBase } from "@customTypes";
import { ChannelType, EmbedBuilder, Events, GuildScheduledEventEntityType, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildScheduledEventDelete,
  once: false,
  async execute(event) {
    if (!event.guild) return;

    const guildConfig = await getGuildConfig(event.guild.id);
    if (!guildConfig) return;
    const t = event.client.i18next.getFixedT(guildConfig.language, "events", "guildScheduledEventDelete");
    if (!guildConfig.event_logs_channel_id) return;
    const logChannel = event.guild.channels.cache.get(toStringId(guildConfig.event_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder().setTimestamp().setThumbnail(event.coverImageURL() ?? event.guild.iconURL());
    if (event.creator) {
      embed.setFooter({
        text: event.creator.tag,
        iconURL: event.creator.displayAvatarURL(),
      });
    }
    if (event.entityType === GuildScheduledEventEntityType.External) {
      embed
        .setColor("Red")
        .setTitle(t("external_channel.embed.title"))
        .setDescription(
          t("external_channel.embed.description", {
            event: event,
            scheduled_start_time: event.scheduledStartAt
              ? time(event.scheduledStartAt, TimestampStyles.LongDateTime)
              : "N/A",
            scheduled_end_time: event.scheduledEndAt ? time(event.scheduledEndAt, TimestampStyles.LongDateTime) : "N/A",
          }),
        );
    } else {
      embed
        .setColor("Red")
        .setTitle(t("voice_channel.embed.title"))
        .setDescription(
          t("voice_channel.embed.description", {
            event: event,
            scheduled_start_time: event.scheduledStartAt
              ? time(event.scheduledStartAt, TimestampStyles.LongDateTime)
              : "N/A",
          }),
        );
    }
    const webhook = await returnWebhook(event.client, logChannel, event.guild.id, {
      id: guildConfig.event_logs_webhook_id,
      type: WebhookType.EVENT_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildScheduledEventDelete embed in ${event.guild?.name} (${event.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildScheduledEventDelete>;
