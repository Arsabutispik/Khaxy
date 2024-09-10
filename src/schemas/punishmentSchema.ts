import mongoose from "mongoose";
const { model, Schema } = mongoose;

const reqString = {
  type: String,
  required: true,
};

const schema = new Schema(
  {
    guildID: reqString,
    userId: reqString,
    staffId: reqString,
    reason: reqString,
    expires: Date,
    type: {
      type: String,
      required: true,
      enum: ["ban", "mute"],
    },
    previousRoles: {
      type: [String],
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export default model("punishmentschema", schema);
