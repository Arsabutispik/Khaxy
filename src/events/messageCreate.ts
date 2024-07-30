import {KhaxyClient} from "../../types";
import {Message} from "discord.js";
import bumpLeaderboardSchema from "../schemas/bumpLeaderboardSchema.js";
import {bumpLeaderboard} from "../utils/utils.js";
export default async(client: KhaxyClient, message: Message) => {
    const leaderboardChannel = client.guildsConfig.get(message.guild!.id)!.config.bumpLeaderboardChannel;
    if(message.interaction && message.interaction.commandName === "bump" && message.author.id === "302050872383242240" && message.channel.id === leaderboardChannel) {
        const results = await bumpLeaderboardSchema.findOne({guildID: message.guild!.id} );
        if(results) {
           const user = results.users.find((result) => result.userID === message.author.id);
              if(user) {
                user.bumps++;
              } else {
                results.users.push({
                     userID: message.author.id,
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
            await bumpLeaderboardSchema.create({
                guildID: message.guild!.id,
                users: [{
                    userID: message.author.id,
                    bumps: 1
                }],
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