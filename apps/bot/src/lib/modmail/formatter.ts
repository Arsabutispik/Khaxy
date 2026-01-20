import { AttachmentBuilder, Client, User } from "discord.js";
import { ModMailAuthorType, ModMailSentToType, ModMailMessage } from "@repo/database";
import dayjs from "dayjs";
import type { TFunction } from "i18next";

export async function modMailTextFile(
  messages: string[] = [],
  modMailMessages: ModMailMessage[] = [],
  client: Client,
  t: TFunction<"translations", "modMailLog">,
  user: User,
) {
  for (const row of modMailMessages) {
    const time = `[${dayjs(row.sentAt).format("YYYY-MM-DD HH:mm:ss")}]`;

    if (row.authorType === ModMailAuthorType.SYSTEM) {
      const prefix = row.sentTo === ModMailSentToType.USER ? t(($) => $.bot) : "[BOT]";
      messages.push(`${time} ${prefix} ${row.content}`);
    } else if (row.authorType === ModMailAuthorType.USER) {
      messages.push(`${time} ${t(($) => $.fromUser)} [${user.tag}] ${row.content}`);
    } else if (row.authorType === ModMailAuthorType.STAFF) {
      const author = await client.users.fetch(row.authorId).catch(() => null);
      const tag = author ? author.tag : "Unknown";
      const key =
        row.sentTo === ModMailSentToType.USER
          ? "toUser"
          : row.sentTo === ModMailSentToType.COMMAND
            ? "command"
            : "toThread";
      messages.push(`${time} ${t(($) => $[key])} [${tag}] ${row.content}`);
    }
  }

  const buffer = Buffer.from(messages.join("\n"), "utf8");
  return new AttachmentBuilder(buffer, { name: `${crypto.randomUUID()}.txt` });
}
