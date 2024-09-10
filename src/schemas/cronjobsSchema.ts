import { model, Schema } from "mongoose";

const cronjobsSchema = new Schema({
  guildID: {
    type: String,
    required: true,
  },
  cronjobs: {
    type: Array,
    default: [],
  },
});

export default model("cronjobs", cronjobsSchema);
