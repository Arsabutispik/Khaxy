import { KhaxyClient } from "../../types";
import bumpLeaderboardSchema from "../schemas/bumpLeaderboardSchema.js";
import {bumpLeaderboard, log} from "./utils";

async function resetBumpLeaderboard(client: KhaxyClient) {
    await bumpLeaderboardSchema.updateMany({}, { $unset: { users: [] } });
    const guilds = await bumpLeaderboardSchema.find();
    for(const guild of guilds) {
        const result = await bumpLeaderboard(client, guild.guildID);
        if(result && result.error) {
            log("ERROR", "src/utlis/resetBumpLeaderBoard.ts",`Failed to reset bump leaderboard for guild ${guild.guildID}`);
        }
    }
}

export default resetBumpLeaderboard;