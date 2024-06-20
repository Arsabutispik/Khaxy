import {HolyClient} from "../types";
import {GuildMember, TextChannel} from "discord.js";
import punishmentSchema from "../schemas/punishmentSchema.js";
import {replaceMassString} from "../utils/utils.js";

export default async (client: HolyClient, member: GuildMember) => {
    const data = client.guildsConfig.get(member.guild.id)
    if(!data) return
    const text = replaceMassString(data.config.welcomeMessage,
        {
            "{tag}": member.user.tag,
            "{server}": member.guild.name,
            "{memberCount}": member.guild.memberCount.toString(),
            "{user}": `<@${member.user.id}>`,
            "{id}": member.user.id,
            "{name}": member.user.username
        })

    const registerText = replaceMassString(data.config.registerMessage,
        {
            "{tag}": member.user.tag,
            "{server}": member.guild.name,
            "{memberCount}": member.guild.memberCount.toString(),
            "{user}": `<@${member.user.id}>`,
            "{id}": member.user.id,
            "{name}": member.user.username
        })
    const result = await punishmentSchema.findOne({ userId: member.id, type: "mute" });
    if (result && await member.guild.roles.fetch(data.config.muteRole)) {
        try {
            await member.roles.add(data.config.muteRole);
        } catch (e) {
            console.log(e)
        }
    }
    const welcomeChannel = await member.guild.channels.fetch(data.config.welcomeChannel) as TextChannel
    if (welcomeChannel && text && welcomeChannel.permissionsFor(client.user!)?.has("SendMessages")) {
        try {
            await welcomeChannel.send(text);
        } catch (e) {
            console.error(e)
        }
    }
    const welcomeChannel2 = await member.guild.channels.cache.get(data.config.registerWelcomeChannel) as TextChannel;
    if (welcomeChannel2 && registerText && welcomeChannel2.permissionsFor(client.user!)?.has("SendMessages")) {
        try {
            await welcomeChannel2.send(registerText);
        } catch (e) {
            console.error(e)
        }
    }
    if(!data.config.registerChannel) {
        if(member.guild.roles.cache.get(data.config.memberRole)){
            try {
                await member.roles.add(data.config.memberRole);
            } catch (e) {
                console.log(e)
            }
        }
    }
}