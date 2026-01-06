import { EventBase } from "@types";
import {
  Events,
} from "discord.js";
import { getOrCreateGuild } from "../../../../../../../../../var/home/ispik/WebstormProjects/Khaxy/packages/database/src/index.js";
import { logsChannelDelete } from "@utils";

export default {
  name: Events.ChannelDelete,
  once: false,
  async execute(channel) {
    if (channel.isDMBased()) return; // Ensure the channel is part of a guild
    const guildConfig = await getOrCreateGuild(channel.guildId);
    if (!guildConfig) return;
    await logsChannelDelete(channel, guildConfig);
  },
} satisfies EventBase<Events.ChannelDelete>;