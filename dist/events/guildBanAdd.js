import { AuditLogEvent } from "discord.js";
import modlog from "../utils/modlog.js";
import { sleep } from "../utils/utils.js";
export default async (client, ban) => {
  const data = client.guildsConfig.get(ban.guild.id);
  if (!data) return;
  if (!(await ban.guild.channels.fetch(data.config.modlogChannel))) return;
  if (!ban.guild.members.me.permissions.has("ViewAuditLog")) {
    await modlog(
      {
        guild: ban.guild,
        user: ban.user,
        action: "BAN",
        actionmaker: client.user,
        reason: client.handleLanguages("BAN_EVENT_ADD_NO_AUDIT_PERMISSION", client, ban.guild.id),
      },
      client,
    );
    return;
  }
  await sleep(1000);
  const auditLog = await ban.guild.fetchAuditLogs({
    type: AuditLogEvent.MemberBanAdd,
    limit: 1,
  });
  const banLog = auditLog.entries.first();
  if (!banLog) return;
  const { executor, target, reason } = banLog;
  if (executor?.id === client.user.id) return;
  if (target?.id !== ban.user.id) {
    await modlog(
      {
        guild: ban.guild,
        user: ban.user,
        action: "BAN",
        actionmaker: client.user,
        reason: client.handleLanguages("BAN_EVENT_ADD_COULDNT_FIND_EXECUTOR", client, ban.guild.id),
      },
      client,
    );
    return;
  }
  await modlog(
    {
      guild: ban.guild,
      user: ban.user,
      action: "BAN",
      actionmaker: executor,
      reason: reason || client.handleLanguages("BAN_EVENT_ADD_NO_REASON_SPECIFIED", client, ban.guild.id),
    },
    client,
  );
};
//# sourceMappingURL=guildBanAdd.js.map
