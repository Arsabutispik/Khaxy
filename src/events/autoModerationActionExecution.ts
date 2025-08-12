import type { EventBase } from "@customTypes";
import { AutoModerationActionType, Events, User } from "discord.js";
import { modLog } from "@utils";
import dayjs from "dayjs";

export default {
  name: Events.AutoModerationActionExecution,
  async execute(execution) {
    // Get the client instance from the guild member
    const client = execution.guild.client;
    // Check if the action type is Timeout
    if (execution.action.type === AutoModerationActionType.Timeout) {
      // Log the timeout action using the modlog utility
      await modLog(
        {
          guild: execution.guild,
          user: execution.user!,
          action: "TIMEOUT",
          moderator: { username: "Automod" } as User,
          reason: "Automod Timeout",
          duration: dayjs().add(execution.action.metadata.durationSeconds!, "seconds"),
        },
        client,
      );
    }
  },
} satisfies EventBase<Events.AutoModerationActionExecution>;
