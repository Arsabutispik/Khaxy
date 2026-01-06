import { EventBase } from "@types";
import { Events} from "discord.js";
import { getOrCreateGuild } from "../@repo/database";
import { logSoundboardSoundUpdate } from "@utils";

export default {
  name: Events.GuildSoundboardSoundUpdate,
  once: false,
  async execute(oldSoundboardSound, newSoundboardSound) {
    const guildConfig = await getOrCreateGuild(newSoundboardSound.guild.id);
    if (!guildConfig) return;
    await logSoundboardSoundUpdate(oldSoundboardSound, newSoundboardSound, guildConfig);
  },
} satisfies EventBase<Events.GuildSoundboardSoundUpdate>;
