import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logThreadDelete } from "@utils";

export default {
  name: Events.ThreadDelete,
  once: false,
  async execute(thread) {
    const guildConfig = await getOrCreateGuild(thread.guild.id);
    if (!guildConfig) return;
    await logThreadDelete(thread, guildConfig);
  },
} satisfies EventBase<Events.ThreadDelete>;
