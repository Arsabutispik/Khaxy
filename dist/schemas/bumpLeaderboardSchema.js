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
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});
export default model("bumpleaderboard", bumpLeaderboardSchema);
//# sourceMappingURL=bumpLeaderboardSchema.js.map