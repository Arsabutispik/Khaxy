import { EventBase } from "@customTypes";
import { AttachmentBuilder, ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";

export default {
  name: Events.MessageBulkDelete,
  async execute(messages) {
    if (messages.size === 0) return;
    const guild = messages.first()?.guild;
    if (!guild) return;

    const guild_config = await getGuildConfig(guild.id);
    if (!guild_config) return;

    const channel = guild.channels.cache.get(toStringId(guild_config.message_logs_channel_id));
    if (!channel || channel.type !== ChannelType.GuildText) return;
    const t = guild.client.i18next.getFixedT(guild_config.language, "events", "messageBulkDelete");
    const webhook = await returnWebhook(guild.client, channel, guild.id, {
      id: guild_config.message_logs_webhook_id,
      type: WebhookType.MESSAGE_LOGS,
    });
    const embed = new EmbedBuilder()
      .setTitle(t("embed.title", { count: messages.size }))
      .setColor("Red")
      .setDescription(t("embed.description", { message: messages.first() }))
      .setTimestamp();
    const buffer = Buffer.from(
      messages
        .toJSON()
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .map((message) => {
          const formattedMessage = {
            id: message.id,
            author: {
              tag: message.author?.tag ?? "Unknown",
            },
            content: message.content?.trim() || "No content",
          };
          return `[${new Date()}] ${t("message", { message: formattedMessage })}`;
        })
        .join("\n"),
      "utf8",
    );
    const attachment = new AttachmentBuilder(buffer, { name: t("file_name") });
    await webhook.send({
      embeds: [embed],
      files: [attachment],
      allowedMentions: { parse: [] }, // Prevent mentions in the log
    });
  },
} satisfies EventBase<Events.MessageBulkDelete>;
