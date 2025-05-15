const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { collections: { AIRDROPS } } = require("../configs")

const airdropSchema = new Schema({
    airdropId: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
        unique: true
    },
    totalRecipients: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
    totalTokens: {
        type: Number,
        required: true,
    },
    isCreated: {
        type: Boolean,
        required: true,
        default: false,
        index: true
    }
}, { _id: true, timestamps: true });


const airdropModel = mongoose.model(AIRDROPS, airdropSchema);


module.exports = {
    airdropModel
}