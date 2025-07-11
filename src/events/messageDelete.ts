import { EventBase } from "@customTypes";
import { ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.MessageDelete,
  async execute(message) {
    if (!message.inGuild()) return;
    if (message.partial) return; // Ignore partial messages
    if (message.author.id === message.client.user.id) return; // Ignore messages sent by the bot itself
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
        t("embed.description", { message, timestamp: time(message.createdAt, TimestampStyles.RelativeTime) }),
      )
      .setTimestamp();
    if (message.content) {
      embed.addFields({ name: t("embed.fields.content"), value: message.content });
    }
    if (message.attachments.size > 0) {
      const maxLength = 1024; // Maximum length for the attachments field
      const links: string[] = [];
      let currentLength = 0;

      for (const a of message.attachments.values()) {
        const link = `[${a.name}](${a.url})`;
        if (currentLength + link.length + 2 > maxLength) break; // +2 for ", "
        links.push(link);
        currentLength += link.length + 2;
      }
      const remaining = message.attachments.size - links.length;
      const suffix = remaining > 0 ? ", [...]" : "";
      const attachmentText = links.join(", ") + suffix;
      embed.addFields({
        name: t("embed.fields.attachments", { count: message.attachments.size }),
        value: `> ${attachmentText}`,
      });
    }
    await webhook
      .send({
        files: message.attachments.size > 0 ? message.attachments.map((a) => a.url) : [],
        embeds: [embed],
        allowedMentions: { parse: [] }, // Prevent mentions in the log
      })
      .catch((error) => {
        logger.log({
          level: "error",
          message: `Failed to send message delete log for guild ${message.guild.id}: ${error.message}`,
          error,
        });
      });
  },
} satisfies EventBase<Events.MessageDelete>;
