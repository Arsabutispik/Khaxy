import { Message, ChannelType, EmbedBuilder, time, TimestampStyles } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logPollCreate(message: Message<true>, guildConfig: GuildWithLogs) {
  if (!message.poll) return;
  const t = message.client.i18next.getFixedT(guildConfig.language, "events", "messageCreate");
  if (!guildConfig.logConfig?.pollLogsChannelId) return;
  const logChannel = message.guild.channels.cache.get(guildConfig.logConfig.pollLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle(t(($) => $.poll_create.embed.title))
    .setDescription(
      t(($) => $.poll_create.embed.description, {
        message: message,
        timestamp: time(message.poll.expiresAt!, TimestampStyles.FullDateShortTime),
        multi_select: message.poll.allowMultiselect
          ? message.client.allEmojis.get(message.client.config.emojis.confirm.id)?.format
          : message.client.allEmojis.get(message.client.config.emojis.reject.id)?.format,
      }),
    )
    .setFields([
      {
        name: message.poll.question.text!,
        value: message.poll.answers
          .map((answer, i) => {
            return `${i}. ${answer.text}`;
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
    id: guildConfig.logConfig.pollLogsWebhookId,
    type: WebhookType.POLL_LOGS,
  });
  if (webhook) {
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send pollCreate embed in ${message.guild.name} (${message.guild.id})`,
        channelId: logChannel.id,
      });
    });
  }
}
