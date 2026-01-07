import { EventBase } from "@types";
import { Events } from "discord.js";
import { logVoteAdd } from "@utils";
import { getOrCreateGuild } from "@repo/database";

export default {
  name: Events.MessagePollVoteAdd,
  once: false,
  async execute(pollAnswer, userId) {
    if (!pollAnswer.poll.message.guild) return;
    const guildConfig = await getOrCreateGuild(pollAnswer.poll.message.guild.id);
    if (!guildConfig) return;
    await logVoteAdd(pollAnswer, userId, guildConfig);
  },
} satisfies EventBase<Events.MessagePollVoteAdd>;
