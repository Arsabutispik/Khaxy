import { KhaxyClient } from "../../@types/types";
import bumpLeaderboardSchema from "../schemas/bumpLeaderboardSchema.js";
import {bumpLeaderboard, log} from "./utils.js";
import cronjobsSchema from "../schemas/cronjobsSchema.js";
import { DateTime } from "luxon";
async function resetBumpLeaderboard(client: KhaxyClient) {
    await bumpLeaderboardSchema.updateMany({}, {$unset: {users: []}});
    const guilds = await bumpLeaderboardSchema.find();
    for (const guild of guilds) {
        cronjobsSchema.findOneAndUpdate({guildID: guild.guildID}, {
            $push: {
                cronjobs: {
                    name: "resetBumpLeaderboardCron",
                    time: DateTime.now().plus({days: 30}).toJSDate(),
                }
            }
        });
        const result = await bumpLeaderboard(client, guild.guildID);
        if (result && result.error) {
            log("ERROR", "src/utlis/resetBumpLeaderBoard.ts", `Failed to reset bump leaderboard for guild ${guild.guildID}`);
        }
    }
}

export default resetBumpLeaderboard;