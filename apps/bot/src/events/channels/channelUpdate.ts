import { EventBase } from "@types";
import {
  Events,
} from "discord.js";
import { getOrCreateGuild } from "../../../../../../../../../var/home/ispik/WebstormProjects/Khaxy/packages/database/src/index.js";
import { logChannelUpdates } from "@utils";

export default {
  name: Events.ChannelUpdate,
  once: false,
  async execute(oldChannel, newChannel) {
    if (oldChannel.isDMBased() || newChannel.isDMBased()) return; // Ensure the channel is part of a guild
    const guildConfig = await getOrCreateGuild(oldChannel.guildId);
    if (!guildConfig) return;
    await logChannelUpdates(oldChannel, newChannel, guildConfig);
  },
} satisfies EventBase<Events.ChannelUpdate>;

