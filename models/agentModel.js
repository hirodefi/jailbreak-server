const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { collections: { AGENTS } } = require("../configs")

const agentSchema = new Schema({
    agentId: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
        unique: true
    },
    agentTask: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    taskHash: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    tokenAmount: {
        type: Number, // in ether
        required: true,
        min: 0
    },
    winnerPrize: {
        type: Number, // in ether
        required: true,
        min: 0,
        default: 0,
    },
    agentTime: {
        type: Number, // unix 
        min: 60
    },
    startTime: {
        type: Number, // unix 
        min: 0
    },
    maxEndTime: {
        type: Number, // unix 
        min: 0
    },
    endTime: {
        type: Number, // unix 
        min: 0,
        default: 0
    },
    isCreated: {
        type: Boolean,
        required: true,
        default: false,
        index: true
    },
    isOver: {
        type: Boolean,
        required: true,
        default: false,
        index: true
    },
    breakAttempts: {   // total attempts
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    winner: {
        type: String,
        default: ""
    },
    airdropId: {
        type: Number,
        unique: true,
        sparse: true
    }
}, { _id: true, timestamps: true });


const agentModel = mongoose.model(AGENTS, agentSchema);


module.exports = {
    agentModel
}