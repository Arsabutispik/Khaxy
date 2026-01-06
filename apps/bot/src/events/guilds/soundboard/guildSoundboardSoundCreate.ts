import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "../@repo/database";
import { logSoundBoardSoundCreate } from "@utils";

export default {
  name: Events.GuildSoundboardSoundCreate,
  once: false,
  async execute(soundboardSound) {
    const guildConfig = await getOrCreateGuild(soundboardSound.guild.id);
    if (!guildConfig) return;
    await logSoundBoardSoundCreate(soundboardSound, guildConfig);
  },
} satisfies EventBase<Events.GuildSoundboardSoundCreate>;
