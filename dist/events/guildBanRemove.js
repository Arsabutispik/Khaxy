import { AuditLogEvent } from "discord.js";
import modlog from "../utils/modlog.js";
export default async (client, ban) => {
    const data = client.guildsConfig.get(ban.guild.id);
    if (!data)
        return;
    if (!await ban.guild.channels.fetch(data.config.modlogChannel))
        return;
    const auditLog = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
    const banLog = auditLog.entries.first();
    const { executor, target, reason } = banLog;
    if ((reason === "softban") || (executor.id === client.user.id)) {
        return;
    }
    if (target?.id !== ban.user.id) {
        await modlog({ guild: ban.guild, user: ban.user, action: "BAN_KALDIR", actionmaker: client.user, reason: "Yasağı kaldıran kişiyi bulamadım" }, client);
        return;
    }
    await modlog({ guild: ban.guild, user: ban.user, action: "BAN_KALDIR", actionmaker: executor, reason: reason || "Sebep Belirtilmemiş." }, client);
};
//# sourceMappingURL=guildBanRemove.js.map