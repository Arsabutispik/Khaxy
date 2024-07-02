import { KhaxyClient } from "../types";
import punishmentSchema from "../schemas/punishmentSchema.ts";
import modlog from "./modlog.ts";
import {User} from "discord.js";
export default async(client: KhaxyClient) => {
    const check = async() => {
        const query = {
            expires: { $lt: new Date()},
        }
        const results = await punishmentSchema.find(query)

        for(const result of results) {
            // @ts-ignore
            const {userId, type, previousRoles, staffId, expires, createdAt, guildID} = result
            const guild = client.guilds.cache.get(guildID!)
            if(!guild) continue
            const member = guild.members.cache.get(userId!)
            if(!member) continue
            const staff = await guild.members.fetch(staffId!)
            if(type === "ban") {
                if(!guild.bans.cache.get(userId!)) continue
                await guild.members.unban(userId!, "Ban Duration Expired")
                await modlog({guild, user: member.user, action: "BAN_END", actionmaker: (staff ? staff : staffId) as unknown as User, reason: client.handleLanguages("BAN_EXPIRED", client, guildID), duration: new Date(expires!).getTime() - new Date(createdAt).getTime()}, client)
            } else if(type === "mute"){
                if(!member){
                    continue
                }
                if(client.guildsConfig.get(guildID!)!.config.muteGetAllRoles) {
                    if (!previousRoles) continue
                    for (const role of previousRoles) {
                        if(!member.guild.roles.cache.get(role)) previousRoles?.splice(previousRoles?.indexOf(role), 1)
                    }
                    await member.roles.add(previousRoles!)
                }
                await member.roles.remove(client.guildsConfig.get(guildID!)!.config.muteRole!)
            }

        }
        await punishmentSchema.deleteMany(query)
        setTimeout(check, 1000 * 60 * 5)
    }
    await check()
}