import { Message, EmbedBuilder, ChannelType, time, TimestampStyles } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logPollDelete(message: Message<true>, guildConfig: GuildWithLogs) {
  if (!message.poll) return;
  const t = message.client.i18next.getFixedT(guildConfig.language, "loggers", "messageEvents");
  if (!guildConfig.logConfig?.messageLogsChannelId) return;
  const logChannel = message.guild.channels.cache.get(guildConfig.logConfig.messageLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(t(($) => $.messageDelete.pollDelete.embed.title))
    .setDescription(
      t(($) => $.messageDelete.pollDelete.embed.description, {
        message: message,
        timestamp: time(message.poll.expiresAt!, TimestampStyles.FullDateShortTime),
        multi_select: message.poll.allowMultiselect
          ? message.client.allEmojis.get(message.client.config.emojis.confirm.id)?.format
          : message.client.allEmojis.get(message.client.config.emojis.reject.id)?.format,
        finalized: message.poll.resultsFinalized
          ? message.client.allEmojis.get(message.client.config.emojis.confirm.id)?.format
          : message.client.allEmojis.get(message.client.config.emojis.reject.id)?.format,
      }),
    )
    .setFields([
      {
        name: message.poll.question.text!,
        value: message.poll.answers
          .map((answer, i) => {
            return `${i}. ${answer.text} ${message.poll?.resultsFinalized ? `(${answer.voteCount})` : ""}`;
          })
          .join("\n"),
      },
    ])
    .setTimestamp()
    .setFooter({
      text: message.author.username,
      iconURL: message.author.displayAvatarURL(),
    });
  const webhook = await returnWebhook(message.client, logChannel, message.guildId, guildConfig, {
    id: guildConfig.logConfig.messageLogsWebhookId,
    type: WebhookType.POLL_LOGS,
  });
  if (webhook) {
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send pollDelete embed in ${message.guild.name} (${message.guild.id})`,
        channelId: logChannel.id,
      });
    });
  }
}
