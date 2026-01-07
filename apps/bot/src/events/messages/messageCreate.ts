import type { EventBase } from "@types";
import { Events } from "discord.js";
import { modMailMessage } from "@utils";
import { getOrCreateGuild } from "@repo/database";
import { logPollCreate } from "@utils";

export default {
  name: Events.MessageCreate,
  async execute(message) {
    await modMailMessage(message);
    if (!message.inGuild()) return;
    const guildConfig = await getOrCreateGuild(message.guild.id);
    if (!guildConfig) return;
    if (message.inGuild() && message.poll) {
      await logPollCreate(message, guildConfig);
    }
  },
} satisfies EventBase<Events.MessageCreate>;
