import { model, Schema } from "mongoose";
const guildSchema = new Schema({
    guildID: { type: String, required: true },
    case: { type: Number, default: 1 },
    config: {
        welcomeChannel: String,
        welcomeMessage: String,
        leaveChannel: String,
        leaveMessage: String,
        registerChannel: String,
        registerMessage: String,
        registerChannelClear: Boolean,
        registerMessageClear: Boolean,
        muteGetAllRoles: Boolean,
        modlogChannel: String,
        muteRole: String,
        maleRole: String,
        femaleRole: String,
        memberRole: String,
        staffRole: [String],
        djRole: String,
        registerWelcomeChannel: String,
        roleOfTheDay: String,
        colorName: String,
        modmail: {
            category: String,
            logChannel: String,
            tickets: {
                type: Number,
                default: 1
            }
        },
        language: {
            type: String,
            default: "en-US",
            enum: ["tr", "en-US"]
        }
    }
}, {
    toObject: {
        transform: function (_doc, ret) {
            delete ret._id;
            delete ret.guildID;
        }
    }
});
export default model("guildschema", guildSchema);
//# sourceMappingURL=guildSchema.js.map