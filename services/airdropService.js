const { airdropModel } = require("../models");
const { collections: { CLAIMS, AIRDROPS } } = require("../configs");

exports.createAirdrop = async (airdrop) => {
    return await airdropModel.create(airdrop);
}

exports.createSessionAirdrop = async (airdrop, options = {}) => {
    return await airdropModel.create([airdrop], options);
}
exports.findAirdropWithFilters = async (filters = {}, projection = null, options = {}) => {
    return await airdropModel.findOne(filters, projection, options);
}

exports.findAirdropById = async (id, projection = null, options = {}) => {
    return await airdropModel.findById(id, projection, options);
}

exports.findAirdropAndUpdate = async (filters = {}, updateQuery = {}, options = {}) => {
    return await airdropModel.findOneAndUpdate(filters, updateQuery, options);
}

exports.findAirdropByIdUpdate = async (id, updateQuery = {}, options = {}) => {
    return await airdropModel.findByIdAndUpdate(id, updateQuery, options);
}

exports.findAirdropAndUpdate = async (filters = {}, updateQuery = {}, options = {}) => {
    return await airdropModel.findOneAndUpdate(filters, updateQuery, options);
}


/**
 * @param {Object} options - {page:number, size:number}
 * @returns {Array} -[{airdropId:number,totalRecipients:number,totalTokens:number,_id:String, createdAt:Date }]
 */
exports.getAirdrops = async (options = {}) => {
    let pipeline = [];

    pipeline.push(
        {
            $sort: { airdropId: -1 }
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
                            airdropId: 1,
                            totalRecipients: 1,
                            totalTokens: 1,
                            isCreated: 1,
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
    return await airdropModel.aggregate(pipeline);
}