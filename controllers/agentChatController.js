const { agentChatService, agentService, agentTempChatService } = require("../services");
const { ErrorBody, ResponseBody, responseHandler } = require("../utils");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { logger } = require('../configs');
const Web3 = require('web3');



exports.createAgentTempChat = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        const { agentId, message } = req.body;
        const { userPublicAddress } = req;

        const agent = await agentService.findAgentWithFilters({ agentId: agentId, isCreated: true }, "", { lean: true });

        if (!agent) {
            const responseBody = new ResponseBody("Agent not found", true, {});
            return responseHandler(res, next, responseBody, 200);
        }
        if (agent.isOver) {
            const responseBody = new ResponseBody("Agent is closed", true, {});
            return responseHandler(res, next, responseBody, 200);
        }
        const messageHash = Web3.utils.keccak256(message);
        let agentIdHex = Web3.utils.numberToHex(agentId);
        agentIdHex = Web3.utils.padLeft(agentIdHex, 64);
        const tempChat = {
            agentId: agentId,
            senderAddress: userPublicAddress,
            message: message,
            messageHash: messageHash
        }

        await agentTempChatService.createTempAgentChat(tempChat);

        const responseBody = new ResponseBody(
            "Temporary chat created",
            false,
            { agentId: agentIdHex, messageHash: messageHash, count: agent.breakAttempts }
        );
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}


exports.getAgentChats = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        let { agentId } = req.query;
        const options = {
            agentId: parseInt(agentId)
        }
        const result = await agentChatService.getAgentChats(options);
        const responseBody = new ResponseBody("Chats successfully retrieved", false, { chats: result });
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}


exports.getAdminAgentChatSummary = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        let { agentId } = req.query;
        const options = {
            agentId: parseInt(agentId)
        }
        const result = await agentChatService.getAgentChatSummary(options);
        const responseBody = new ResponseBody("chat summary successfully retrieved", false, { summary: result });
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}