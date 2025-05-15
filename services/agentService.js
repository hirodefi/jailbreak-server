const { agentModel } = require("../models");
const { collections: { AGENTS } } = require("../configs");


exports.createAgent = async (agent) => {
    return await agentModel.create(agent);
}

exports.findAgentWithFilters = async (filters = {}, projection = null, options = {}) => {
    return await agentModel.findOne(filters, projection, options);
}

exports.findAgentsWithFilters = async (filters = {}, projection = null, options = {}) => {
    return await agentModel.find(filters, projection, options);
}
exports.findAgentById = async (id, projection = null, options = {}) => {
    return await agentModel.findById(id, projection, options);
}

exports.findAgentAndUpdate = async (filters = {}, updateQuery = {}, options = {}) => {
    return await agentModel.findOneAndUpdate(filters, updateQuery, options);
}

exports.findAgentsAndUpdate = async (filters = {}, updateQuery = {}, options = {}) => {
    return await agentModel.updateMany(filters, updateQuery, options);
}

exports.findAgentByIdUpdate = async (id, updateQuery = {}, options = {}) => {
    return await agentModel.findByIdAndUpdate(id, updateQuery, options);
}



/**
 * @param {Object} options - {page:number, size:number}
 * @returns {Array} -[ ]
 */
exports.getAgents = async (options = {}) => {
    let pipeline = [];

    pipeline.push(
        {
            $sort: { agentId: -1 }
        },
        {
            $facet: {
                metadata: [{
                    $group: {
                        _id: null,
                        total: { $sum: 1 }
                    }
                }],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $project: {
                            _id: 1,
                            agentId: 1,
                            agentTask: 1,
                            tokenAmount: 1,
                            startTime: 1,
                            maxEndTime: 1,
                            endTime: 1,
                            isCreated: 1,
                            isOver: 1,
                            breakAttempts: 1,
                            winner: 1,
                            airdropId: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            winnerPrize: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );
    return await agentModel.aggregate(pipeline);
}


exports.getUserAgents = async (options = {}) => {
    let pipeline = [];

    pipeline.push(
        {
            $match: {
                isCreated: true
            }
        },
        {
            $sort: { agentId: -1 }
        },
        {
            $facet: {
                metadata: [{
                    $group: {
                        _id: null,
                        total: { $sum: 1 }
                    }
                }],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $project: {
                            _id: 1,
                            agentId: 1,
                            agentTask: 1,
                            tokenAmount: 1,
                            startTime: 1,
                            maxEndTime: 1,
                            endTime: 1,
                            isOver: 1,
                            breakAttempts: 1,
                            winner: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        }
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );
    return await agentModel.aggregate(pipeline);
}
