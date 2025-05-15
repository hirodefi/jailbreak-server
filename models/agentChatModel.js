const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { collections: { AGENT_CHATS } } = require("../configs")

const agentChatSchema = new Schema({
    agentId: {
        type: Number,
        required: true,
        min: 1,
    },
    order: {
        type: Number,
        required: true,
        min: 1,
    },
    senderType: {
        type: String,
        required: true,
        enum: ["GPT", "USER"],
        default: "USER"
    },
    senderAddress: {
        type: String, // "0" for GPT
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    messageHash: {
        type: String,
        trim: true,
        lowercase: true
    },
    isWon: {
        type: Boolean,
        required: true,
        default: false,
        index: true
    },
}, { _id: true, timestamps: true });



agentChatSchema.index({ agentId: 1, order: 1 }, { unique: true });


const agentChatModel = mongoose.model(AGENT_CHATS, agentChatSchema);


module.exports = {
    agentChatModel
}