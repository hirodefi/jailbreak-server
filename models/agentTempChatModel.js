const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { collections: { TEMP_AGENT_CHATS } } = require("../configs")

const tempAgentChatSchema = new Schema({
    agentId: {
        type: Number,
        required: true,
        min: 1,
    },
    senderAddress: {
        type: String, // "0" for GPT
        required: true,
        trim: true,
        lowercase: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    messageHash: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    }
}, { _id: true, timestamps: true });



tempAgentChatSchema.index({ agentId: 1, senderAddress: 1, messageHash: 1 });


const agentTempChatModel = mongoose.model(TEMP_AGENT_CHATS, tempAgentChatSchema);


module.exports = {
    agentTempChatModel
}