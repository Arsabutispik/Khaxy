import { EventBase } from "@types";
import { Events, VoiceState } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logVoiceStateUpdate } from "@utils"; // Adjust import path as needed

export default {
  name: Events.VoiceStateUpdate,
  async execute(oldState: VoiceState, newState: VoiceState) {
    // We only fetch config here to pass it down
    const guildConfig = await getOrCreateGuild(newState.guild.id);
    if (!guildConfig) return;

    await logVoiceStateUpdate(oldState, newState, guildConfig);
  },
} satisfies EventBase<Events.VoiceStateUpdate>;
