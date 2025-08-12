import { EventBase } from "@customTypes";
import { AttachmentBuilder, ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.MessageBulkDelete,
  async execute(messages) {
    if (messages.size === 0) return;
    const guild = messages.first()?.guild;
    if (!guild) return;

    const guildConfig = await getGuildConfig(guild.id);
    if (!guildConfig) return;

    const logChannel = await guild.channels.fetch(toStringId(guildConfig.message_logs_channel_id)).catch(() => null);
    if (!logChannel || logChannel.type !== ChannelType.GuildText) return;
    const t = guild.client.i18next.getFixedT(guildConfig.language, "events", "messageBulkDelete");
    const webhook = await returnWebhook(guild.client, logChannel, guild.id, {
      id: guildConfig.message_logs_webhook_id,
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
    await webhook
      .send({
        embeds: [embed],
        files: [attachment],
        allowedMentions: { parse: [] }, // Prevent mentions in the log
      })
      .catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send messageBulkDelete embed in ${guild.name} (${guild.id})`,
          channelId: logChannel.id,
        });
      });
  },
} satisfies EventBase<Events.MessageBulkDelete>;
