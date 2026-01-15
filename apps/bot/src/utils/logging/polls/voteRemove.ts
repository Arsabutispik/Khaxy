import { PollAnswer, PartialPollAnswer, ChannelType, EmbedBuilder, time, TimestampStyles } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logVoteRemove(
  pollAnswer: PollAnswer | PartialPollAnswer,
  userId: string,
  guildConfig: GuildWithLogs,
) {
  if (!pollAnswer.poll.message.guild) return;

  const t = pollAnswer.client.i18next.getFixedT(guildConfig.language, "events", "messagePollVoteRemove");
  if (!guildConfig.logConfig?.pollLogsChannelId) return;
  const logChannel = pollAnswer.poll.message.guild.channels.cache.get(guildConfig.logConfig.pollLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(t(($) => $.embed.title))
    .setDescription(
      t(($) => $.embed.description, {
        message: pollAnswer.poll.message,
        answerer: userId,
        question: pollAnswer.poll.question.text,
        answer: pollAnswer.text,
        timestamp: time(pollAnswer.poll.expiresAt!, TimestampStyles.FullDateShortTime),
        multi_select: pollAnswer.poll.allowMultiselect
          ? pollAnswer.client.allEmojis.get(pollAnswer.client.config.emojis.confirm.id)?.format
          : pollAnswer.client.allEmojis.get(pollAnswer.client.config.emojis.reject.id)?.format,
      }),
    )
    .setTimestamp();
  const webhook = await returnWebhook(
    pollAnswer.poll.message.client,
    logChannel,
    pollAnswer.poll.message.guild.id,
    guildConfig,
    {
      id: guildConfig.logConfig.pollLogsWebhookId,
      type: WebhookType.POLL_LOGS,
    },
  );
  if (webhook) {
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send messagePollVoteRemove embed in ${pollAnswer.poll.message.guild?.name} (${pollAnswer.poll.message.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  }
}
