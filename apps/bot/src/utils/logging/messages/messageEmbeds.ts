import { EmbedBuilder, Message, PartialMessage } from "discord.js";
import { TFunction } from "i18next";

export function buildMessageEditEmbed(
  oldMessage: Message | PartialMessage,
  newMessage: Message<true>,
  t: TFunction<"loggers", "messageEvents">,
) {
  return new EmbedBuilder()
    .setTitle(t(($) => $.messageUpdate.embed.title))
    .setDescription(t(($) => $.messageUpdate.embed.description, { message: newMessage }))
    .setColor("Yellow")
    .addFields([
      {
        name: t(($) => $.messageUpdate.embed.fields.oldContent),
        value: oldMessage.content || t(($) => $.messageUpdate.errors.noContent),
        inline: true,
      },
      {
        name: t(($) => $.messageUpdate.embed.fields.newContent),
        value: newMessage.content || t(($) => $.messageUpdate.errors.noContent),
        inline: true,
      },
    ])
    .setTimestamp();
}
