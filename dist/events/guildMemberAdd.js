import { TextChannel } from "discord.js";
export default async (_client, member) => {
    const welcomeChannel = member.guild.channels.cache.get("1007594023667630090");
    if (!welcomeChannel || !(welcomeChannel instanceof TextChannel)) {
        return;
    }
    await welcomeChannel.send(`${member} Sunucuya katıldı!`);
};
//# sourceMappingURL=guildMemberAdd.js.map