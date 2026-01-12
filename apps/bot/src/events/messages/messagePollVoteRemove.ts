import { EventBase } from "@types";
import { Events } from "discord.js";
import { logVoteRemove } from "@utils";
import { getOrCreateGuild } from "@repo/database";

export default {
  name: Events.MessagePollVoteRemove,
  once: false,
  async execute(pollAnswer, userId) {
    if (!pollAnswer.poll.message.guild) return;
    const guildConfig = await getOrCreateGuild(pollAnswer.poll.message.guild.id);
    if (!guildConfig) return;
    await logVoteRemove(pollAnswer, userId, guildConfig);
  },
} satisfies EventBase<Events.MessagePollVoteRemove>;
