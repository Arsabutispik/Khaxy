import { AutoModerationActionType } from "discord.js";
import modlog from "../utils/modlog.js";
export default async (client, execution) => {
  if (execution.action.type === AutoModerationActionType.Timeout) {
    await modlog(
      {
        guild: execution.guild,
        user: execution.user,
        action: "TIMEOUT",
        actionmaker: client.user,
        reason: "Automod triggered a timeout",
        duration: execution.action.metadata.durationSeconds * 1000,
      },
      client,
    );
  }
};
//# sourceMappingURL=autoModerationActionExecution.js.map
