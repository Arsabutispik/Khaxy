import mongoose from "mongoose";
const { model, Schema } = mongoose;
const caseResultSchema = new Schema({
    case: {
        required: true,
        type: Number
    },
    reason: {
        required: true,
        type: String
    },
    staffId: {
        required: true,
        type: String
    },
    userId: {
        required: true,
        type: String
    },
    changes: {
        type: [Object]
    }
});
export default model("caseResultSchema", caseResultSchema);
//# sourceMappingURL=caseResultSchema.js.map