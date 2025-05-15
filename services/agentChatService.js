const { agentChatModel } = require("../models");
const { collections: { AGENTS } } = require("../configs");


exports.createAgentChat = async (chat) => {
    return await agentChatModel.create(chat);
}

exports.createAgentChats = async (chats) => {
    return await agentChatModel.insertMany(chats);
}

exports.findAgentChatWithFilters = async (filters = {}, projection = null, options = {}) => {
    return await agentChatModel.findOne(filters, projection, options);
}

exports.findAgentChatsWithFilters = async (filters = {}, projection = null, options = {}) => {
    return await agentChatModel.find(filters, projection, options);
}
exports.findAgentChatById = async (id, projection = null, options = {}) => {
    return await agentChatModel.findById(id, projection, options);
}

exports.findAgentChatAndUpdate = async (filters = {}, updateQuery = {}, options = {}) => {
    return await agentChatModel.findOneAndUpdate(filters, updateQuery, options);
}

exports.findAgentChatByIdUpdate = async (id, updateQuery = {}, options = {}) => {
    return await agentChatModel.findByIdAndUpdate(id, updateQuery, options);
}


exports.getAgentChats = async (options = {}) => {
    let pipeline = [];

    pipeline.push(
        {
            $match: {
                agentId: options.agentId
            }
        },
        {
            $sort: { order: 1 }
        },
        {
            $project: {
                _id: 1,
                agentId: 1,
                order: 1,
                senderType: 1,
                senderAddress: 1,
                message: 1,
                isWon: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        }
    );
    return await agentChatModel.aggregate(pipeline);
}


exports.getAgentChatSummary = async (options = {}) => {
    let pipeline = [];

    pipeline.push(
        {
            $match: {
                agentId: options.agentId,
                senderType:"USER"
            }
        },
        {
            $sort: { order: 1 }
        },
        {
            $project: {
                _id: 0,
                senderAddress: 1,
            }
        },
        {
            $group: {
                _id: "$senderAddress",
                attempts: { $sum: 1 }
            }
        },
        {
            $project: {
                _id:0,
                senderAddress: "$_id",
                attempts: 1
            }
        }
    );
    return await agentChatModel.aggregate(pipeline);
}