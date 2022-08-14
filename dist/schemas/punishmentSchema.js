import mongoose from "mongoose";
const { model, Schema } = mongoose;
const reqString = {
    type: String,
    required: true
};
const schema = new Schema({
    userId: reqString,
    staffId: reqString,
    reason: reqString,
    expires: Date,
    type: {
        type: String,
        required: true,
        enum: ["ban", "mute"]
    }
}, {
    timestamps: true
});
export default model("punishmentschema", schema);
//# sourceMappingURL=punishmentSchema.js.map