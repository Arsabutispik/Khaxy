import { ChannelType, Message, PartialMessage } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";
import { buildMessageEditEmbed } from "./messageEmbeds.js";

export async function logMessageEdit(
  oldMessage: Message | PartialMessage,
  newMessage: Message<true>,
  guildConfig: GuildWithLogs,
) {
  // 1. Validation: Content change, Ignore bots, Check config
  if (oldMessage.content === newMessage.content) return;
  if (newMessage.author?.bot) return; // Use optional chaining as partials might lack author
  if (!guildConfig.logConfig?.messageLogsChannelId) return;

  // 2. Get Channel & Webhook
  const logChannel = await newMessage.guild?.channels
    .fetch(guildConfig.logConfig.messageLogsChannelId)
    .catch(() => null);

  if (logChannel?.type !== ChannelType.GuildText) return;

  const webhook = await returnWebhook(newMessage.client, logChannel, newMessage.guild!.id, guildConfig, {
    id: guildConfig.logConfig.messageLogsWebhookId,
    type: WebhookType.MESSAGE_LOGS,
  });

  if (!webhook) return;

  // 3. Build & Send
  const t = newMessage.client.i18next.getFixedT(guildConfig.language, "loggers", "messageEvents");
  const embed = buildMessageEditEmbed(oldMessage, newMessage, t);

  await webhook
    .send({
      embeds: [embed],
      allowedMentions: { parse: [] }, // Important: Block pings in logs
    })
    .catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send messageUpdate embed in ${newMessage.guild?.name}`,
        channelId: logChannel.id,
      });
    });
}
