const { claimModel } = require("../models");
const { collections: { CLAIMS, AIRDROPS } } = require("../configs");


exports.createClaim = async (claim, options = {}) => {
    return await claimModel.create(claim, options);
}

exports.createClaims = async (claims = [], options = {}) => {
    return await claimModel.insertMany(claims, options);
}

exports.findclaimWithFilters = async (filters = {}, projection = null, options = {}) => {
    return await claimModel.findOne(filters, projection, options);
}

exports.findclaimsWithFilters = async (filters = {}, projection = null, options = {}) => {
    return await claimModel.find(filters, projection, options);
}
exports.findclaimById = async (id, projection = null, options = {}) => {
    return await claimModel.findById(id, projection, options);
}

exports.findclaimAndUpdate = async (filters = {}, updateQuery = {}, options = {}) => {
    return await claimModel.findOneAndUpdate(filters, updateQuery, options);
}

exports.findclaimsAndUpdate = async (filters = {}, updateQuery = {}, options = {}) => {
    return await claimModel.updateMany(filters, updateQuery, options);
}

exports.findclaimByIdUpdate = async (id, updateQuery = {}, options = {}) => {
    return await claimModel.findByIdAndUpdate(id, updateQuery, options);
}

