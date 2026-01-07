import type { EventBase } from "@types";
import { ChannelType, Events } from "discord.js";
import { findAnyOpenThread } from "@repo/database";

export default {
  name: Events.TypingStart,
  async execute(typing) {
    const client = typing.client;
    if (typing.channel.type === ChannelType.DM) {
      const thread = await findAnyOpenThread(typing.user.id);
      if (!thread) return;
      const guild = client.guilds.cache.get(thread.guildId);
      if (!guild) return;
      const channel = guild.channels.cache.get(thread.channelId);
      if (!channel) return;
      if (channel.type !== ChannelType.GuildText) return;
      if (channel.isThread()) return;
      await channel.sendTyping();
    }
  },
} satisfies EventBase<Events.TypingStart>;
