import { EventBase } from "@customTypes";
import { ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.MessageDelete,
  async execute(message) {
    if (!message.inGuild() || message.partial) return;
    if (message.author.id === message.client.user.id) return;

    const guild_config = await getGuildConfig(message.guild.id);
    if (!guild_config) return;

    const channel = message.guild.channels.cache.get(toStringId(guild_config.message_logs_channel_id));
    if (!channel || channel.type !== ChannelType.GuildText) return;

    const t = message.client.i18next.getFixedT(guild_config.language, "events", "messageDelete");
    const webhook = await returnWebhook(message.client, channel, message.guild.id, {
      id: guild_config.message_logs_webhook_id,
      type: WebhookType.MESSAGE_LOGS,
    });

    if (message.author.id === webhook.id) return;

    const embed = new EmbedBuilder()
      .setTitle(t("embed.title"))
      .setColor("Red")
      .setDescription(
        t("embed.description", {
          message,
          timestamp: time(message.createdAt, TimestampStyles.RelativeTime),
        }),
      )
      .setTimestamp();

    if (message.content) {
      embed.addFields({ name: t("embed.fields.content"), value: message.content });
    }

    const attachments = [...message.attachments.values()];

    // Generate attachment field text (limited to 1024 characters)
    if (attachments.length > 0) {
      const links: string[] = [];
      let currentLength = 0;

      for (const a of attachments) {
        const link = `[${a.name}](${a.url})`;
        if (currentLength + link.length + 2 > 1024) break;
        links.push(link);
        currentLength += link.length + 2;
      }

      const remaining = attachments.length - links.length;
      const suffix = remaining > 0 ? ", [...]" : "";
      embed.addFields({
        name: t("embed.fields.attachments", { count: attachments.length }),
        value: `> ${links.join(", ")}${suffix}`,
      });
    }

    // Split attachments into batches under 8MB
    const maxBytes = 8 * 1024 * 1024; // 8MB
    const batches: string[][] = [];
    let currentBatch: string[] = [];
    let currentSize = 0;

    for (const a of attachments) {
      if (currentSize + a.size > maxBytes) {
        batches.push(currentBatch);
        currentBatch = [];
        currentSize = 0;
      }
      currentBatch.push(a.url);
      currentSize += a.size;
    }
    if (currentBatch.length > 0) batches.push(currentBatch);

    // Send first batch with embed
    let sentMessage;
    try {
      sentMessage = await webhook.send({
        files: batches[0] || [],
        embeds: [embed],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      logger.log({
        level: "error",
        message: `Failed to send message delete log for guild ${message.guild.id}: ${error.message}`,
        error,
      });
      return;
    }

    // Send follow-up messages for remaining batches
    for (let i = 1; i < batches.length; i++) {
      const batch = batches[i];
      try {
        await webhook.send({
          content: `[Batch ${i + 1}/${batches.length}](${sentMessage.url})`,
          files: batch,
          allowedMentions: { parse: [] },
        });
      } catch (error) {
        logger.log({
          level: "error",
          message: `Failed to send batch ${i + 1} for message delete log in guild ${message.guild.id}: ${error.message}`,
          error,
        });
      }
    }
  },
} satisfies EventBase<Events.MessageDelete>;
