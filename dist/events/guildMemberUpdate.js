import { AuditLogEvent } from "discord.js";
import { sleep } from "../utils/utils.js";
import modlog from "../utils/modlog.js";
export default async (client, oldMember, newMember) => {
  if (!oldMember.isCommunicationDisabled() && newMember.isCommunicationDisabled()) {
    await sleep(1000);
    const fetchedLogs = await oldMember.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberUpdate,
    });
    const log = fetchedLogs.entries.first();
    if (Date.now() - log.createdTimestamp >= 5000) return;
    if (!log) {
      await modlog(
        {
          guild: oldMember.guild,
          user: newMember.user,
          action: "TIMEOUT",
          actionmaker: client.user,
          reason: client.handleLanguages("TIMEOUT_COULD_NOT_FIND_EXECUTER", client, oldMember.guild.id),
          duration: newMember.communicationDisabledUntilTimestamp - Date.now(),
        },
        client,
      );
    } else {
      await modlog(
        {
          guild: oldMember.guild,
          user: newMember.user,
          action: "TIMEOUT",
          actionmaker: log.executor,
          reason: log.reason || client.handleLanguages("TIMEOUT_NO_REASON_GIVEN", client, oldMember.guild.id),
          duration: newMember.communicationDisabledUntilTimestamp - Date.now(),
        },
        client,
      );
    }
  }
};
//# sourceMappingURL=guildMemberUpdate.js.map
