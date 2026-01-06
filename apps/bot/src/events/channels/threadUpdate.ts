import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logThreadUpdate } from "@utils";

export default {
  name: Events.ThreadUpdate,
  once: false,
  async execute(oldThread, newThread) {
    const guildConfig = await getOrCreateGuild(newThread.guild.id);
    if (!guildConfig) return;
    await logThreadUpdate(oldThread, newThread, guildConfig);
  },
} satisfies EventBase<Events.ThreadUpdate>;
