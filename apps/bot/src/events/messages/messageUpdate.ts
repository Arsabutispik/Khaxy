import { EventBase } from "@types";
import { Events, Message, PartialMessage } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logMessageEdit, logPollFinalization, handleModMailMessageUpdate } from "@utils";

export default {
  name: Events.MessageUpdate,
  async execute(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
    // 1. Resolve Partials
    if (oldMessage.partial) {
      try {
        oldMessage = await oldMessage.fetch();
      } catch {
        return;
      }
    }
    if (newMessage.partial) {
      try {
        newMessage = await newMessage.fetch();
      } catch {
        return;
      }
    }

    // 2. CASE A: DM / ModMail
    if (!newMessage.inGuild()) {
      await handleModMailMessageUpdate(oldMessage, newMessage);
      return;
    }

    // 3. CASE B: Guild Event (Logging)
    // Fetch config ONCE for both loggers
    const guildConfig = await getOrCreateGuild(newMessage.guildId);
    if (!guildConfig) return;

    // Run loggers in parallel
    await Promise.all([
      logMessageEdit(oldMessage, newMessage, guildConfig),
      logPollFinalization(oldMessage, newMessage, guildConfig),
    ]);
  },
} satisfies EventBase<Events.MessageUpdate>;
