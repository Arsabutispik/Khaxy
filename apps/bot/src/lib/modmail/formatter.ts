import { AttachmentBuilder, Client, User } from "discord.js";
import { ModMailAuthorType, ModMailSentToType } from "@repo/database";
import dayjs from "dayjs";
import type { TFunction } from "i18next";

export async function modMailTextFile(
  messages: string[] = [],
  modMailMessages: any[] = [],
  client: Client,
  t: TFunction,
  user: User,
) {
  for (const row of modMailMessages) {
    const time = `[${dayjs(row.sentAt).format("YYYY-MM-DD HH:mm:ss")}]`;

    if (row.authorType === ModMailAuthorType.SYSTEM) {
      const prefix = row.sentTo === ModMailSentToType.USER ? t(($) => $.bot_to_user) : "[BOT]";
      messages.push(`${time} ${prefix} ${row.content}`);
    } else if (row.authorType === ModMailAuthorType.USER) {
      messages.push(`${time} ${t(($) => $.from_user)} [${user.tag}] ${row.content}`);
    } else if (row.authorType === ModMailAuthorType.STAFF) {
      const author = await client.users.fetch(row.authorId).catch(() => null);
      const tag = author ? author.tag : "Unknown";
      const key =
        row.sentTo === ModMailSentToType.USER
          ? "to_user"
          : row.sentTo === ModMailSentToType.COMMAND
            ? "command"
            : "to_thread";
      messages.push(`${time} ${t(key)} [${tag}] ${row.content}`);
    }
  }

  const buffer = Buffer.from(messages.join("\n"), "utf8");
  return new AttachmentBuilder(buffer, { name: `${crypto.randomUUID()}.txt` });
}
