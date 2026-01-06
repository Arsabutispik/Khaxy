import { EventBase } from "@types";
import {getOrCreateGuild} from "../../../../../../../../../../var/home/ispik/WebstormProjects/Khaxy/packages/database/src/index.js";
import { Events } from "discord.js";
import { logSoundBoardSoundDelete } from "@utils";

export default {
  name: Events.GuildSoundboardSoundDelete,
  once: false,
  async execute(soundboardSound) {
    if (!soundboardSound.available) return;
    const guildConfig = await getOrCreateGuild(soundboardSound.guild.id);
    if (!guildConfig) return;
    await logSoundBoardSoundDelete(soundboardSound, guildConfig);
  },
} satisfies EventBase<Events.GuildSoundboardSoundDelete>;