import { EmbedBuilder, Message, PartialMessage, time, TimestampStyles } from "discord.js";
import { TFunction } from "i18next";

export function buildPollResultEmbed(newMessage: Message | PartialMessage, t: TFunction) {
  if (!newMessage.poll) return null;

  const client = newMessage.client;
  const config = client.config;

  const multiSelectIcon = newMessage.poll.allowMultiselect
    ? client.allEmojis.get(config.emojis.confirm.id)?.format
    : client.allEmojis.get(config.emojis.reject.id)?.format;

  return new EmbedBuilder()
    .setColor("Red")
    .setTitle(t(($) => $.poll_end.embed.title))
    .setDescription(
      t(($) => $.poll_end.embed.description, {
        message: newMessage,
        timestamp: newMessage.poll.expiresAt
          ? time(newMessage.poll.expiresAt, TimestampStyles.FullDateShortTime)
          : t("unknown_time"),
        multi_select: multiSelectIcon,
      }),
    )
    .setFields([
      {
        name: newMessage.poll.question.text || t(($) => $.unknown_question),
        value: newMessage.poll.answers.map((answer, i) => `${i}. ${answer.text} (${answer.voteCount})`).join("\n"),
      },
    ])
    .setTimestamp()
    .setFooter({
      text: newMessage.author?.username || t(($) => $.unknown_user),
      iconURL: newMessage.author?.displayAvatarURL(),
    });
}
