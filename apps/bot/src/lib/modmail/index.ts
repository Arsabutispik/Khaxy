import { Client, Message, TextChannel, User, ChannelType } from "discord.js";
import {
  getOrCreateGuild,
  getThreadMessages,
  getModMailThreads,
  getThreadByChannelId,
  ModMailAuthorType,
  ModMailSentToType,
} from "@repo/database";
import { handleUserDM } from "./dmHandler.js";
import { handleStaffReply } from "./guildHandler.js";
import { modMailTextFile } from "./formatter.js";
import dayjs from "dayjs";

export async function modMailMessage(message: Message) {
  if (message.author.bot) return;

  if (message.channel.type === ChannelType.DM) {
    return handleUserDM(message);
  }

  if (message.inGuild() && message.channel.type === ChannelType.GuildText) {
    const thread = await getThreadByChannelId(message.channel.id);
    if (thread) {
      return handleStaffReply(message);
    }
  }
}

/**
 * Log the thread transcript.
 * Exported for use in your 'close' command or listener.
 */
export async function modMailLog(client: Client, channel: TextChannel, user: User | null, closer: User) {
  const guildConfig = await getOrCreateGuild(channel.guildId);
  if (!guildConfig.modMailChannelId || !user) return;

  const t = client.i18next.getFixedT(guildConfig.language, null, "mod_mail_log");
  const logChannel = channel.guild.channels.cache.get(guildConfig.modMailChannelId);

  if (!logChannel || logChannel.type !== ChannelType.GuildText) return;

  const modMailMessages = await getThreadMessages(channel.id);
  if (!modMailMessages || modMailMessages.length === 0) return;

  const threads = await getModMailThreads(channel.guildId);
  const transcriptLines: string[] = [
    t(($) => $.initial, {
      thread_id: threads?.length || 1,
      user,
      time: dayjs(modMailMessages[0].sentAt),
    }),
  ];

  const attachment = await modMailTextFile(transcriptLines, modMailMessages, client, t, user);

  await logChannel.send({
    content: t(($) => $.close_message, {
      thread_id: threads?.length || 1,
      user,
      closer,
      messages: {
        user: modMailMessages.filter(
          (m) => m.authorType === ModMailAuthorType.USER && m.sentTo === ModMailSentToType.THREAD,
        ).length,
        staff: modMailMessages.filter(
          (m) => m.authorType === ModMailAuthorType.STAFF && m.sentTo === ModMailSentToType.USER,
        ).length,
        internal: modMailMessages.filter(
          (m) => m.authorType === ModMailAuthorType.STAFF && m.sentTo === ModMailSentToType.THREAD,
        ).length,
      },
    }),
    allowedMentions: { parse: [] },
    files: [attachment],
  });
}
