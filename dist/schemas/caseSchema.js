import mongoose from "mongoose";
const { model, Schema } = mongoose;
const userSchema = new Schema({
    _id: String,
    case: {
        type: Number,
        default: 1
    }
});
export default model("caseSchema", userSchema);
//# sourceMappingURL=caseSchema.js.map