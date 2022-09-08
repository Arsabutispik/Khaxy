import modlog from "../utils/modlog.js";
import caseResultSchema from "../schemas/caseResultSchema.js";
import caseSchema from "../schemas/caseSchema.js";
export default async (client, member) => {
    const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_KICK',
    });
    const kickLog = fetchedLogs.entries.first();
    const { executor, target, reason, createdTimestamp } = kickLog;
    if ((Date.now() - createdTimestamp) <= 10000) {
        if (executor?.id === client.user.id)
            return;
        if (target?.id !== member.user.id) {
            modlog(member.guild, member.user, "BAN", client.user, "Sunucudan atan kişiyi bulamadım.");
            return;
        }
        let cases = await caseSchema.findOne({ _id: member.guild.id });
        if (!cases) {
            cases = await caseSchema.findOneAndUpdate({ _id: member.guild.id }, {}, { setDefaultsOnInsert: true, new: true, upsert: true });
        }
        modlog(member.guild, member.user, "AT", executor, reason || "Sebep Belirtilmemiş.");
        await new caseResultSchema({ case: cases.case, reason: reason || "Sebep Belirtilmemiş.", userId: target.id, staffId: executor.id }).save();
    }
};
//# sourceMappingURL=guildMemberRemove.js.map