const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { collections: { CLAIMS } } = require("../configs")

const claimShema = new Schema({
    airdropId: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
        index: true
    },
    order: {  //claim index in the airdrop
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    address: { //address of the receiver
        type: String,
        required: true,
        index: true,
        lowercase: true,
        trim: true
    },
    amount: {
        type: Number, // in Eth (tokens to transfer)
        required: true,
        min: 0,
        default: 0
    },
    isCreated: {
        type: Boolean,
        required: true,
        default: false,
        index: true
    }
}, { _id: true, timestamps: true });


claimShema.index({ airdropId: 1, order: 1 }, { unique: true });
claimShema.index({ airdropId: 1, address: 1 }, { unique: true });

const claimModel = mongoose.model(CLAIMS, claimShema);




module.exports = {
    claimModel
}