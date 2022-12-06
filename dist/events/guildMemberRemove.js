import modlog from "../utils/modlog.js";
import { AuditLogEvent } from "discord.js";
import { replaceMassString } from "../utils/utils.js";
export default async (client, member) => {
    const data = client.guildsConfig.get(member.guild.id);
    if (!data)
        return;
    if (member.guild.channels.cache.get(data.config.leaveChannel)) {
        const text = replaceMassString(data.config.leaveMessage, {
            "{tag}": member.user.tag,
            "{server}": member.guild.name,
            "{memberCount}": member.guild.memberCount.toString(),
            "{user}": `<@${member.user.id}>`,
            "{id}": member.user.id,
            "{name}": member.user.username
        });
        const leaveChannel = await member.guild.channels.fetch(data.config.leaveChannel);
        await leaveChannel.send(text);
    }
    if (data.config.registerMessageClear) {
        const welcomeChannel = member.guild.channels.cache.get(data.config.registerChannel);
        const wmsgs = await welcomeChannel.messages.fetch();
        await welcomeChannel.bulkDelete(wmsgs.filter(m => m.mentions.members.has(member.user.id)));
    }
    if (!await member.guild.channels.fetch(data.config.modlogChannel))
        return;
    const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
    });
    const kickLog = fetchedLogs.entries.first();
    if (!kickLog)
        return;
    const { executor, target, reason, createdTimestamp } = kickLog;
    if ((Date.now() - createdTimestamp) <= 5000) {
        if (executor?.id === client.user.id)
            return;
        if (target?.id !== member.user.id) {
            await modlog({ guild: member.guild, user: member.user, action: "AT", actionmaker: client.user, reason: "Sunucudan atan kişiyi bulamadım." }, client);
            return;
        }
        await modlog({ guild: member.guild, user: member.user, action: "AT", actionmaker: executor, reason: reason || "Sebep Belirtilmemiş." }, client);
    }
};
//# sourceMappingURL=guildMemberRemove.js.map