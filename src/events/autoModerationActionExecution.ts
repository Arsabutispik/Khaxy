import { AutoModerationActionExecution, AutoModerationActionType } from "discord.js";
import { KhaxyClient } from "../../@types/types";
import modlog from "../utils/modlog.js";

export default async (client: KhaxyClient, execution: AutoModerationActionExecution) => {
  if (execution.action.type === AutoModerationActionType.Timeout) {
    await modlog(
      {
        guild: execution.guild,
        user: execution.user!,
        action: "TIMEOUT",
        actionmaker: client.user!,
        reason: "Automod triggered a timeout",
        duration: execution.action.metadata.durationSeconds! * 1000,
      },
      client,
    );
  }
};
