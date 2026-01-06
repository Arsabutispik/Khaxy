import { EventBase } from "@types";
import {
  Events,
} from "discord.js";
import { getOrCreateGuild, GuildWithLogs } from "@repo/database";
import { logChannelCreate } from "@utils";

export default {
  name: Events.ChannelCreate,
  once: false,
  async execute(channel) {
    const guildConfig = await getOrCreateGuild(channel.guildId);
    if (!guildConfig) return;
    await logChannelCreate(channel, guildConfig);
  },
} satisfies EventBase<Events.ChannelCreate>;