import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logStickerDelete } from "@utils";
export default {
  name: Events.GuildStickerDelete,
  once: false,
  async execute(sticker) {
    if (!sticker.guild) return;
    const guildConfig = await getOrCreateGuild(sticker.guild.id);
    if (!guildConfig) return;
    await logStickerDelete(sticker, guildConfig);
  },
} satisfies EventBase<Events.GuildStickerDelete>;
