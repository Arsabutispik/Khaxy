import { model, Schema } from "mongoose";
const openMailsSchema = new Schema(
  {
    guildID: { type: String, required: true },
    channelID: { type: String, required: true },
    userID: { type: String, required: true },
    messages: { type: Array, required: true },
    messageCount: {
      type: {
        modMessageCount: { type: Number, required: true, default: 0 },
        userMessageCount: { type: Number, required: true, default: 0 },
        internalMessageCount: { type: Number, required: true, default: 0 },
      },
      required: true,
    },
    threadNumber: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);
export default model("openmailschema", openMailsSchema);
//# sourceMappingURL=openMailsSchema.js.map
