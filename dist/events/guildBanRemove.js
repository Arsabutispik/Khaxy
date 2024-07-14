import { AuditLogEvent } from "discord.js";
import modlog from "../utils/modlog.js";
import { sleep } from "../utils/utils.js";
export default async (client, ban) => {
    const data = client.guildsConfig.get(ban.guild.id);
    if (!data)
        return;
    if (!await ban.guild.channels.fetch(data.config.modlogChannel))
        return;
    if (!ban.guild.members.me.permissions.has("ViewAuditLog")) {
        await modlog({ guild: ban.guild, user: ban.user, action: "BAN_REMOVE", actionmaker: client.user, reason: client.handleLanguages("BAN_EVENT_REMOVE_NO_AUDIT_PERMISSION", client, ban.guild.id) }, client);
        return;
    }
    await sleep(1000);
    const auditLog = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
    const banLog = auditLog.entries.first();
    const { executor, target, reason } = banLog;
    if ((reason === "softban") || (executor.id === client.user.id)) {
        return;
    }
    if (target?.id !== ban.user.id) {
        await modlog({ guild: ban.guild, user: ban.user, action: "BAN_REMOVE", actionmaker: client.user, reason: client.handleLanguages("BAN_EVENT_REMOVE_COULDNT_FIND_EXECUTOR", client, ban.guild.id) }, client);
        return;
    }
    await modlog({ guild: ban.guild, user: ban.user, action: "BAN_REMOVE", actionmaker: executor, reason: reason || client.handleLanguages("BAN_EVENT_REMOVE_NO_REASON_SPECIFIED", client, ban.guild.id) }, client);
};
//# sourceMappingURL=guildBanRemove.js.map