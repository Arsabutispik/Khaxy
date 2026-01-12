import { ChannelType, Message, PartialMessage } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";
import { buildPollResultEmbed } from "./pollEmbeds.js";

export async function logPollFinalization(
  oldMessage: Message | PartialMessage,
  newMessage: Message | PartialMessage,
  guildConfig: GuildWithLogs,
) {
  // 1. Validation: Check if poll results just finalized
  if (oldMessage.poll?.resultsFinalized === newMessage.poll?.resultsFinalized || !newMessage.poll?.resultsFinalized) {
    return;
  }

  if (!guildConfig.logConfig?.pollLogsChannelId) return;

  // 2. Get Channel & Webhook
  const logChannel = newMessage.guild?.channels.cache.get(guildConfig.logConfig.pollLogsChannelId);

  if (logChannel?.type !== ChannelType.GuildText) return;

  const webhook = await returnWebhook(newMessage.client, logChannel, newMessage.guild!.id, guildConfig, {
    id: guildConfig.logConfig.pollLogsWebhookId,
    type: WebhookType.POLL_LOGS,
  });

  if (!webhook) return;

  // 3. Build & Send
  const t = newMessage.client.i18next.getFixedT(guildConfig.language, "events", "messageUpdate");
  const embed = buildPollResultEmbed(newMessage, t);

  if (!embed) return;

  await webhook.send({ embeds: [embed] }).catch((error) => {
    logger.log({
      level: "error",
      error,
      message: `Failed to send pollFinalize embed in ${newMessage.guild?.name}`,
      channelId: logChannel.id,
    });
  });
}
