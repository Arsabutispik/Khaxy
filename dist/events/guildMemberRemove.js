import modlog from "../utils/modlog.js";
import { AuditLogEvent } from "discord.js";
import { replaceMassString } from "../utils/utils.js";
export default async (client, member) => {
    const data = client.guildsConfig.get(member.guild.id);
    if (!data)
        return;
    if (member.guild.channels.cache.get(data.config.leaveChannel) && data.config.leaveMessage) {
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
        try {
            const welcomeChannel = await member.guild.channels.fetch(data.config.registerChannel);
            const wmsgs = await welcomeChannel.messages.fetch();
            await welcomeChannel.bulkDelete(wmsgs.filter(m => m.mentions.members.has(member.user.id)));
        }
        catch (e) {
            console.error(e);
        }
    }
    if (!await member.guild.channels.fetch(data.config.modlogChannel))
        return;
    if (!member.guild.members.me.permissions.has("ViewAuditLog")) {
        return;
    }
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