import { Message } from "discord.js";
import { getOrCreateGuild, addMessageToThread, ModMailAuthorType, ModMailSentToType } from "@repo/database";
import { logger } from "@lib";

export async function handleStaffReply(message: Message) {
  const config = await getOrCreateGuild(message.guildId!);
  const t = message.client.i18next.getFixedT(config.language, "events", "messageCreate.mod_mail");

  const content = message.attachments.size
    ? `${message.content}\n${message.attachments.map((a) => a.url).join("\n")}`
    : message.content;

  try {
    await addMessageToThread(
      message.channel.id,
      content,
      message.author.id,
      message.author.bot ? ModMailAuthorType.SYSTEM : ModMailAuthorType.STAFF,
      ModMailSentToType.THREAD,
      message.id,
    );
  } catch (e) {
    logger.error({ message: "Error saving staff reply", error: e });
    await message.reply(t(($) => $.error_inserting));
  }
}
