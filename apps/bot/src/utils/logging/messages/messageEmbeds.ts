import { EmbedBuilder, Message, PartialMessage } from "discord.js";
import { TFunction } from "i18next";

export function buildMessageEditEmbed(
  oldMessage: Message | PartialMessage,
  newMessage: Message | PartialMessage,
  t: TFunction,
) {
  return new EmbedBuilder()
    .setTitle(t("embed.title"))
    .setDescription(t("embed.description", { message: newMessage }))
    .setColor("Yellow")
    .addFields([
      {
        name: t("embed.fields.oldContent"),
        value: oldMessage.content || t("errors.unknown_content"),
        inline: true,
      },
      {
        name: t("embed.fields.newContent"),
        value: newMessage.content || t("errors.unknown_content"),
        inline: true,
      },
    ])
    .setTimestamp();
}
