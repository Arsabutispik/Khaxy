import punishmentSchema from "../schemas/punishmentSchema.js";
import { replaceMassString } from "../utils/utils.js";
export default async (client, member) => {
    if(member.partial) await member.fetch()
    const data = client.guildsConfig.get(member.guild.id);
    if (!data)
        return;
    const text = replaceMassString(data.config.welcomeMessage, {
        "{tag}": member.user.tag,
        "{server}": member.guild.name,
        "{memberCount}": member.guild.memberCount.toString(),
        "{user}": `<@${member.user.id}>`,
        "{id}": member.user.id,
        "{name}": member.user.username
    });
    const registerText = replaceMassString(data.config.registerMessage, {
        "{tag}": member.user.tag,
        "{server}": member.guild.name,
        "{memberCount}": member.guild.memberCount.toString(),
        "{user}": `<@${member.user.id}>`,
        "{id}": member.user.id,
        "{name}": member.user.username
    });
    const result = await punishmentSchema.findOne({ userId: member.id, type: "mute" });
    if (result && await member.guild.roles.fetch(data.config.muteRole)) {
        try {
            await member.roles.add(data.config.muteRole);
        }
        catch (e) {
            console.log(e);
        }
    }
    const welcomeChannel = await member.guild.channels.fetch(data.config.welcomeChannel);
    if (!welcomeChannel) {
        return;
    }
    const welcomeChannel2 = await member.guild.channels.fetch(data.config.registerWelcomeChannel);
    if (!welcomeChannel2) {
        return;
    }
    try {
        await welcomeChannel2.send(registerText);
        await welcomeChannel.send(text);
    }
    catch (e) {
        console.log(e);
    }
    if (!data.config.registerChannel) {
        if (member.guild.roles.cache.get(data.config.welcomeRole)) {
            try {
                await member.roles.add(data.config.welcomeRole);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
};
//# sourceMappingURL=guildMemberAdd.js.map
