import { KhaxyClient } from "../../@types/types"
import guildSchema from "../schemas/guildSchema.js";
import {ColorResolvable} from "discord.js"
import ntc from "../utils/ntc.js"
import cronjobsSchema from "../schemas/cronjobsSchema.js";
import {DateTime} from "luxon";
export default async (client: KhaxyClient) => {
    const guilds = await guildSchema.find()
    console.log("Before loop")
    for(const guildConfig of guilds) {
        const guild = client.guilds.cache.get(guildConfig.guildID);
        if(!guild) continue
        if(!guild.members.me!.permissions.has("ManageRoles")) continue;
        if(!guildConfig.config) continue;
        if(!guildConfig.config.roleOfTheDay) continue;
        const role = guild.roles.cache.get(guildConfig.config.roleOfTheDay);
        if(!role) continue;
        if(role.position >= guild.members.me!.roles.highest.position) continue;
        const name = role.name.replace(guildConfig.config!.colorName!, "");
        let x=Math.round(0xffffff * Math.random()).toString(16);
        let y=(6-x.length);
        let z="000000";
        let z1 = z.substring(0,y);
        let color =`#${z1 + x}` as ColorResolvable;
        let result = ntc.name(color);
        let colorName = result[1];
        try {
            await guildConfig.updateOne({
                $set: {
                    "config.colorName": colorName
                }
            })
            console.log("Before edit")
            await role.edit({name: `${name}${colorName}`, color: color, reason: "Role of the day!"})
            await cronjobsSchema.findOneAndUpdate({guildID: guild.id}, {
                $pull: {
                    cronjobs: {
                        name: "colorCron"
                    }
                }
            })
            await cronjobsSchema.findOneAndUpdate({guildID: guild.id}, {
                $push: {
                    cronjobs: {
                        name: "colorCron",
                        time: DateTime.now().plus({days: 1}).toJSDate(),
                    }
                }
            })
        } catch (e) {
            console.error(e)
        }
    }
}

async function specificGuildColorUpdate(client: KhaxyClient, guildId: string) {
    const guildConfig = await guildSchema.findOne({guildID: guildId})
    if(!guildConfig) return
    const guild = client.guilds.cache.get(guildConfig.guildID);
    if(!guild) return
    if(!guild.members.me!.permissions.has("ManageRoles")) return;
    if(!guildConfig.config) return;
    if(!guildConfig.config.roleOfTheDay) return;
    const role = guild.roles.cache.get(guildConfig.config.roleOfTheDay);
    if(!role) return;
    if(role.position >= guild.members.me!.roles.highest.position) return;
    const name = role.name.replace(guildConfig.config!.colorName!, "");
    let x=Math.round(0xffffff * Math.random()).toString(16);
    let y=(6-x.length);
    let z="000000";
    let z1 = z.substring(0,y);
    let color =`#${z1 + x}` as ColorResolvable;
    let result = ntc.name(color);
    let colorName = result[1];
    try {
        await guildConfig.updateOne({
            $set: {
                "config.colorName": colorName
            }
        })
        console.log("Before edit")
        await role.edit({name: `${name}${colorName}`, color: color, reason: "Role of the day!"})
        await cronjobsSchema.findOneAndUpdate({guildID: guild.id}, {
            $pull: {
                cronjobs: {
                    name: "colorCron"
                }
            }
        })
        await cronjobsSchema.findOneAndUpdate({guildID: guild.id}, {
            $push: {
                cronjobs: {
                    name: "colorCron",
                    time: DateTime.now().plus({days: 1}).toJSDate(),
                }
            }
        })
    } catch (e) {
        console.error(e)
    }
}

export {specificGuildColorUpdate};