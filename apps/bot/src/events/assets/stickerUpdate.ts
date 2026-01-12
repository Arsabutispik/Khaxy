import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logStickerUpdate } from "@utils";

export default {
  name: Events.GuildStickerUpdate,
  once: false,
  async execute(oldSticker, newSticker) {
    if (!newSticker.guild || !oldSticker.guild) return;
    const guildConfig = await getOrCreateGuild(newSticker.guild.id);
    if (!guildConfig) return;
    await logStickerUpdate(oldSticker, newSticker, guildConfig);
  },
} satisfies EventBase<Events.GuildStickerUpdate>;
