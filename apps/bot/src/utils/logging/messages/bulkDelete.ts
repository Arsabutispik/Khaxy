import {
  ReadonlyCollection,
  Message,
  PartialMessage,
  Guild,
  ChannelType,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logMessageBulkDelete(
  messages: ReadonlyCollection<string, Message<true> | PartialMessage<true>>,
  guild: Guild,
  guildConfig: GuildWithLogs,
) {
  if (!guildConfig.logConfig?.messageLogsChannelId) return;
  const logChannel = guild.channels.cache.get(guildConfig.logConfig.messageLogsChannelId);
  if (!logChannel || logChannel.type !== ChannelType.GuildText) return;
  const t = guild.client.i18next.getFixedT(guildConfig.language, "loggers", "messageEvents");
  const webhook = await returnWebhook(guild.client, logChannel, guild.id, guildConfig, {
    id: guildConfig.logConfig.messageLogsWebhookId,
    type: WebhookType.MESSAGE_LOGS,
  });
  const message = messages.first();
  if (!message) return;
  const embed = new EmbedBuilder()
    .setTitle(t(($) => $.messageBulkDelete.embed.title, { count: messages.size }))
    .setColor("Red")
    .setDescription(t(($) => $.messageBulkDelete.embed.description, { message }))
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
        return `[${new Date().toLocaleDateString(guildConfig.language)}] ${t(($) => $.messageBulkDelete.message, { message: formattedMessage })}`;
      })
      .join("\n"),
    "utf8",
  );
  const attachment = new AttachmentBuilder(buffer, { name: t(($) => $.messageBulkDelete.fileName) });
  if (webhook) {
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
  }
}
