const { logger } = require("./winston");
const mongoDBConection = require("./mongoDBConnection");
const collections = require("./collections");
const agentWeb3Config = require("./agentWeb3Config");
const airdropWeb3Config = require("./airdropWeb3Config");
const openAIConfig = require("./openAIConfig");





module.exports = {
    logger,
    mongoDBConection,
    collections,
    agentWeb3Config,
    airdropWeb3Config,
    openAIConfig,
}