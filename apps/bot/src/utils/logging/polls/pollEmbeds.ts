import { EmbedBuilder, Message, PartialMessage, time, TimestampStyles } from "discord.js";
import { TFunction } from "i18next";

export function buildPollResultEmbed(newMessage: Message | PartialMessage, t: TFunction<"loggers", "messageEvents">) {
  if (!newMessage.poll) return null;

  const client = newMessage.client;
  const config = client.config;

  const multiSelectIcon = newMessage.poll.allowMultiselect
    ? client.allEmojis.get(config.emojis.confirm.id)?.format
    : client.allEmojis.get(config.emojis.reject.id)?.format;

  return new EmbedBuilder()
    .setColor("Red")
    .setTitle(t(($) => $.messageUpdate.pollEnd.embed.title))
    .setDescription(
      t(($) => $.messageUpdate.pollEnd.embed.description, {
        message: newMessage,
        timestamp: newMessage.poll.expiresAt
          ? time(newMessage.poll.expiresAt, TimestampStyles.FullDateShortTime)
          : t(($) => $.messageUpdate.pollEnd.unknownTime),
        multi_select: multiSelectIcon,
      }),
    )
    .setFields([
      {
        name: newMessage.poll.question.text || t(($) => $.messageUpdate.pollEnd.unknownQuestion),
        value: newMessage.poll.answers.map((answer, i) => `${i}. ${answer.text} (${answer.voteCount})`).join("\n"),
      },
    ])
    .setTimestamp()
    .setFooter({
      text: newMessage.author?.username || t(($) => $.messageUpdate.pollEnd.unknownUser),
      iconURL: newMessage.author?.displayAvatarURL(),
    });
}
