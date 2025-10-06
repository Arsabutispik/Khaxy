import { EventBase } from "@customTypes";
import { ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.ThreadCreate,
  once: false,
  async execute(thread) {
    const guildConfig = await getGuildConfig(thread.guild.id);
    if (!guildConfig) return;
    const t = thread.client.i18next.getFixedT(guildConfig.language, "events", "threadCreate");
    if (!guildConfig.thread_logs_channel_id) return;
    const logChannel = thread.guild.channels.cache.get(toStringId(guildConfig.thread_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
          thread,
          parent: thread.parent,
          auto_archive_duration: t(`thread_auto_archive_duration.${thread.autoArchiveDuration}`),
          timestamp: time(thread.createdAt || new Date(), TimestampStyles.LongDateTime),
        }),
      )
      .setTimestamp();
    const owner = await thread.guild.members.fetch(thread.ownerId!).catch(() => null);
    if (owner) {
      embed.setFooter({
        text: owner.user.username,
        iconURL: owner.user.displayAvatarURL(),
      });
    }
    const webhook = await returnWebhook(thread.client, logChannel, thread.guild.id, {
      id: guildConfig.thread_logs_webhook_id,
      type: WebhookType.THREAD_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send threadCreate embed in ${thread.guild.name} (${thread.guild.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.ThreadCreate>;
