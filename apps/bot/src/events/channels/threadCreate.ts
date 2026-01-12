import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logThreadCreate } from "@utils";

export default {
  name: Events.ThreadCreate,
  once: false,
  async execute(thread) {
    const guildConfig = await getOrCreateGuild(thread.guild.id);
    if (!guildConfig) return;
    await logThreadCreate(thread, guildConfig);
  },
} satisfies EventBase<Events.ThreadCreate>;
