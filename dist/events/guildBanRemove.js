import modlog from "../utils/modlog.js";
import caseResultSchema from "../schemas/caseResultSchema.js";
import caseSchema from "../schemas/caseSchema.js";
export default async (client, ban) => {
    const auditLog = await ban.guild.fetchAuditLogs({ type: "MEMBER_BAN_REMOVE", limit: 1 });
    const banLog = auditLog.entries.first();
    const { executor, target, reason } = banLog;
    if (target?.id !== ban.user.id) {
        modlog(ban.guild, ban.user, "BAN_KALDIR", client.user, "Yasağı kaldıran kişiyi bulamadım");
        return;
    }
    if ((reason === "softban") && (executor.id === client.user.id)) {
        return;
    }
    let cases = await caseSchema.findOne({ _id: ban.guild.id });
    if (!cases) {
        cases = await caseSchema.findOneAndUpdate({ _id: ban.guild.id }, {}, { setDefaultsOnInsert: true, new: true, upsert: true });
    }
    modlog(ban.guild, ban.user, "BAN_KALDIR", executor, reason || "Sebep Belirtilmemiş.");
    await new caseResultSchema({ case: cases.case, reason: reason || "Sebep Belirtilmemiş.", userId: target.id, staffId: executor.id }).save();
};
//# sourceMappingURL=guildBanRemove.js.map