import { model, Schema } from "mongoose";
const bumpLeaderboardSchema = new Schema({
    guildID: {
        type: String,
        required: true,
    },
    users: {
        type: Array,
        default: [],
    }
});
export default model("bumpleaderboard", bumpLeaderboardSchema);
//# sourceMappingURL=bumpLeaderboardSchema.js.map