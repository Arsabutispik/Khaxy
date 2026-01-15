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
  const t = guild.client.i18next.getFixedT(guildConfig.language, "events", "messageBulkDelete");
  const webhook = await returnWebhook(guild.client, logChannel, guild.id, guildConfig, {
    id: guildConfig.logConfig.messageLogsWebhookId,
    type: WebhookType.MESSAGE_LOGS,
  });
  const embed = new EmbedBuilder()
    .setTitle(t(($) => $.embed.title, { count: messages.size }))
    .setColor("Red")
    .setDescription(t(($) => $.embed.description, { message: messages.first() }))
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
        return `[${new Date()}] ${t(($) => $.message, { message: formattedMessage })}`;
      })
      .join("\n"),
    "utf8",
  );
  const attachment = new AttachmentBuilder(buffer, { name: t(($) => $.file_name) });
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
