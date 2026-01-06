import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "../../../../../../../../../var/home/ispik/WebstormProjects/Khaxy/packages/database/src/index.js";
import { logsEmojiUpdate } from "@utils";

export default {
  name: Events.GuildEmojiUpdate,
  once: false,
  async execute(oldEmoji, newEmoji) {
    const guildConfig = await getOrCreateGuild(newEmoji.guild.id);
    if (!guildConfig) return;
    await logsEmojiUpdate(newEmoji, oldEmoji, guildConfig);
  },
} satisfies EventBase<Events.GuildEmojiUpdate>;