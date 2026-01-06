import { EventBase } from "src/types/index.js";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logsEmojiDelete } from "@utils";

export default {
  name: Events.GuildEmojiDelete,
  once: false,
  async execute(emoji) {
    const guildConfig = await getOrCreateGuild(emoji.guild.id);
    if (!guildConfig) return;
    await logsEmojiDelete(emoji, guildConfig);
  },
} satisfies EventBase<Events.GuildEmojiDelete>;