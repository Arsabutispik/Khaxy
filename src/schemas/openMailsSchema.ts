import {model, Schema} from "mongoose";
const openMailsSchema = new Schema({
    guildID: {type: String, required: true},
    channelID: {type: String, required: true},
    userID: {type: String, required: true},
    messages: {type: String, required: true}
});
export default model("openmailschema", openMailsSchema);