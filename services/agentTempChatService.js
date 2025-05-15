const { agentTempChatModel } = require("../models");
const { collections: { AGENTS } } = require("../configs");


exports.createTempAgentChat = async (chat) => {
    return await agentTempChatModel.create(chat);
}

exports.findTempAgentChatWithFilters = async (filters = {}, projection = null, options = {}) => {
    return await agentTempChatModel.findOne(filters, projection, options);
}

exports.findTempAgentChatsWithFilters = async (filters = {}, projection = null, options = {}) => {
    return await agentTempChatModel.find(filters, projection, options);
}
exports.findTempAgentChatById = async (id, projection = null, options = {}) => {
    return await agentTempChatModel.findById(id, projection, options);
}

exports.findTempAgentChatAndUpdate = async (filters = {}, updateQuery = {}, options = {}) => {
    return await agentTempChatModel.findOneAndUpdate(filters, updateQuery, options);
}

exports.findTempAgentChatByIdUpdate = async (id, updateQuery = {}, options = {}) => {
    return await agentTempChatModel.findByIdAndUpdate(id, updateQuery, options);
}

exports.deleteTempChat = async (id) => {
    return await agentTempChatModel.findByIdAndDelete(id);
}