const { agentService } = require("../services");
const { ErrorBody, ResponseBody, responseHandler } = require("../utils");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { logger } = require('../configs');
const Web3 = require('web3');



exports.createAgent = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        let { task, tokenAmount, agentTime, winnerPrize } = req.body;
        agentTime = parseInt(agentTime);

        const latestAgent = await agentService.findAgentWithFilters({}, "_id agentId", { sort: { agentId: -1 }, lean: true });
        const agentId = latestAgent ? latestAgent.agentId + 1 : 1;
        const taskHash = Web3.utils.keccak256(task);
        let agentIdHex = Web3.utils.numberToHex(agentId);
        agentIdHex = Web3.utils.padLeft(agentIdHex, 64);
        let tokenAmountWei = Web3.utils.toWei(tokenAmount, "ether");

        const agent = {
            agentId: agentId,
            agentTask: task,
            taskHash: taskHash,
            tokenAmount: tokenAmount,
            isCreated: false,
            isOver: false,
            breakAttempts: 0,
            winner: "",
            agentTime: agentTime,
            winnerPrize: winnerPrize
        };
        await agentService.createAgent(agent);
        const responseBody = new ResponseBody("Agent successfully created", false, { agentId: agentIdHex, taskHash, tokenAmount: tokenAmountWei, agentTime: agentTime, winnerPrize });
        responseHandler(res, next, responseBody, 201);
    } catch (error) {
        next(error);
    }
}

exports.getAgents = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        let { page, size } = req.query;
        page = parseInt(page);
        size = parseInt(size);
        page = isNaN(page) ? 0 : page;
        size = isNaN(size) ? 10 : size;
        const options = { page, size };
        const result = await agentService.getAgents(options);
        let data = {
            records: result[0]?.data || [],
            maxRecords: result[0]?.maxRecords || 0
        }
        const responseBody = new ResponseBody("Agents successfully retrieved", false, data);
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}


exports.getAgent = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        const { agentId } = req.query;

        const result = await agentService.findAgentWithFilters({ agentId }, "_id agentId agentTask taskHash tokenAmount startTime winnerPrize maxEndTime endTime isCreated isOver breakAttempts winner airdropId createdAt updatedAt", { lean: true });
        let responseBody;
        if (result) {
            responseBody = new ResponseBody("Agent successfully retrieved", false, result);
        }
        else {
            responseBody = new ResponseBody("Agent not found", true, {});
        }
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}


exports.getUserAgents = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        let { page, size } = req.query;
        page = parseInt(page);
        size = parseInt(size);
        page = isNaN(page) ? 0 : page;
        size = isNaN(size) ? 10 : size;
        const options = { page, size };
        const result = await agentService.getUserAgents(options);
        let data = {
            records: result[0]?.data || [],
            maxRecords: result[0]?.maxRecords || 0
        }
        const responseBody = new ResponseBody("Agents successfully retrieved", false, data);
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}

exports.getUserAgent = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        const { agentId } = req.query;

        const result = await agentService.findAgentWithFilters({ agentId }, "_id agentId agentTask taskHash tokenAmount startTime maxEndTime endTime winnerPrize isCreated isOver breakAttempts winner createdAt updatedAt", { lean: true });
        let responseBody;
        if (result) {
            responseBody = new ResponseBody("Agent successfully retrieved", false, result);
        }
        else {
            responseBody = new ResponseBody("Agent not found", true, {});
        }
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}