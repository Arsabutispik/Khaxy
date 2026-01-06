import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild, } from "../../../../../../../../../var/home/ispik/WebstormProjects/Khaxy/packages/database/src/index.js";
import { logEmojiCreate } from "@utils";

export default {
  name: Events.GuildEmojiCreate,
  once: false,
  async execute(emoji) {
    const guildConfig = await getOrCreateGuild(emoji.guild.id);
    if (!guildConfig) return;
    await logEmojiCreate(emoji, guildConfig);
  },
} satisfies EventBase<Events.GuildEmojiCreate>;