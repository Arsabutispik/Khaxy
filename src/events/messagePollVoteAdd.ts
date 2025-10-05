import { EventBase } from "@customTypes";
import { ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";
import { getGuildConfig } from "@database";

export default {
  name: Events.MessagePollVoteAdd,
  once: false,
  async execute(pollAnswer, userId) {
    if (!pollAnswer.poll.message.guild) return;
    const guildConfig = await getGuildConfig(pollAnswer.poll.message.guild.id);
    if (!guildConfig) return;
    const t = pollAnswer.client.i18next.getFixedT(guildConfig.language, "events", "messagePollVoteAdd");
    if (!guildConfig.poll_logs_channel_id) return;
    const logChannel = pollAnswer.poll.message.guild.channels.cache.get(toStringId(guildConfig.poll_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
          message: pollAnswer.poll.message,
          answerer: userId,
          question: pollAnswer.poll.question.text,
          answer: pollAnswer.text,
          timestamp: time(pollAnswer.poll.expiresAt, TimestampStyles.LongDateTime),
          multi_select: pollAnswer.poll.allowMultiselect
            ? pollAnswer.client.allEmojis.get(pollAnswer.client.config.emojis.confirm.id)?.format
            : pollAnswer.client.allEmojis.get(pollAnswer.client.config.emojis.reject.id)?.format,
        }),
      )
      .setTimestamp();
    const webhook = await returnWebhook(pollAnswer.poll.message.client, logChannel, pollAnswer.poll.message.guild.id, {
      id: guildConfig.poll_logs_webhook_id,
      type: WebhookType.POLL_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send messagePollVoteAdd embed in ${pollAnswer.poll.message.guild?.name} (${pollAnswer.poll.message.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.MessagePollVoteAdd>;
