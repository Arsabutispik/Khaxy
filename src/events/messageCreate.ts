import {KhaxyClient} from "../../types";
import {ChannelType, Message} from "discord.js";
import bumpLeaderboardSchema from "../schemas/bumpLeaderboardSchema.js";
import {bumpLeaderboard} from "../utils/utils.js";
export default async(client: KhaxyClient, message: Message) => {
    if(message.channel.type === ChannelType.DM) return;
    const config = client.guildsConfig.get(message.guild!.id);
    if(!config) return;
    const leaderboardChannel = config.config.bumpLeaderboardChannel;
    if(message.interaction && message.interaction.commandName === "bump" && message.author.id === "302050872383242240" && message.channel.id === leaderboardChannel) {
        const results = await bumpLeaderboardSchema.findOne({guildID: message.guild!.id} );
        if(results) {
           const user = results.users.find((result) => result.userID === message.author.id);
              if(user) {
                user.bumps++;
              } else {
                results.users.push({
                     userID: message.interaction.user.id,
                     bumps: 1
                });
              }
                await bumpLeaderboardSchema.findOneAndUpdate({
                    guildID: message.guild!.id,
                }, {
                    $set: {
                        users: results.users,
                    },
                });

        } else {
            await bumpLeaderboardSchema.findOneAndUpdate({
                guildID: message.guild!.id,
            }, {
                users: [{
                    userID: message.interaction.user.id,
                    bumps: 1,
                }],
            }, {
                upsert: true,
                timestamps: true,
            });
        }
        await message.delete();
        const result = await bumpLeaderboard(client, message.guild!.id);
        if(result && result.error) {
            message.channel.send({content: "An error occurred while updating the leaderboard. Please try again later.\nError: " + result.error});
        }
    } else if(message.channel.id === leaderboardChannel && message.author.id !== client.user!.id) {
        await message.delete();
    }
}