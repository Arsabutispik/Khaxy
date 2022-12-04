import { AuditLogEvent } from "discord.js";
import modlog from "../utils/modlog.js";
export default async (client, ban) => {
    const data = client.guildsConfig.get(ban.guild.id);
    if (!data)
        return;
    if (!await ban.guild.channels.fetch(data.config.modlogChannel))
        return;
    const auditLog = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
    const banLog = auditLog.entries.first();
    if (!banLog)
        return;
    const { executor, target, reason } = banLog;
    if (executor?.id === client.user.id)
        return;
    if (target?.id !== ban.user.id) {
        await modlog({ guild: ban.guild, user: ban.user, action: "BAN", actionmaker: client.user, reason: "Yasaklayan kişiyi bulamadım" }, client);
        return;
    }
    await modlog({ guild: ban.guild, user: ban.user, action: "BAN", actionmaker: executor, reason: reason || "Sebep Belirtilmemiş." }, client);
};
//# sourceMappingURL=guildBanAdd.js.map