import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logStickerCreate} from "@utils";

export default {
  name: Events.GuildStickerCreate,
  once: false,
  async execute(sticker) {
    if (!sticker.guild) return;
    const guildConfig = await getOrCreateGuild(sticker.guild.id);
    if (!guildConfig) return;
    await logStickerCreate(sticker, guildConfig)
  },
} satisfies EventBase<Events.GuildStickerCreate>;
