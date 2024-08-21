import { model, Schema } from "mongoose";
const bumpLeaderboardSchema = new Schema({
    guildID: {
        type: String,
        required: true,
    },
    users: {
        type: Array,
        default: [],
    },
    winner: {
        user: {
            userID: String,
            bumps: Number,
        },
        totalBumps: Number,
    }
});
export default model("bumpleaderboard", bumpLeaderboardSchema);
//# sourceMappingURL=bumpLeaderboardSchema.js.map