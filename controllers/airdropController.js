const { merkleTreeService, claimService, airdropService } = require("../services");
const { ErrorBody, ResponseBody, responseHandler } = require("../utils");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Web3 = require("web3");
const { logger } = require('../configs');


exports.createAirdrop = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        const { recipients, totalCount, totalAmount } = req.body;

        if (recipients.length !== totalCount) {
            throw new ErrorBody(400, "Bad Input", [{
                field: "totalCount",
                message: "totalCount mismatch",
            }]);
        }

        const calculatedAmount = recipients.reduce((sum, { amount }) => {
            return sum + amount;
        }, 0)

        if (calculatedAmount !== totalAmount) {
            throw new ErrorBody(400, "Bad Input", [{
                field: "totalAmount",
                message: "totalAmount mismatch",
            }]);
        }

        let latestAirdrop = await airdropService.findAirdropWithFilters({}, 'airdropId', { sort: { airdropId: -1 }, lean: true });
        const airdropId = latestAirdrop ? latestAirdrop.airdropId + 1 : 1;


        let session;
        try {
            const airdrop = {
                airdropId: airdropId,
                totalRecipients: totalCount,
                totalTokens: totalAmount
            }

            session = await mongoose.startSession();

            await session.withTransaction(async () => {
                const result = await airdropService.createSessionAirdrop(airdrop, { session });
                const claims = recipients.map(({ address, amount }, index) => {
                    return {
                        address: address.toLowerCase().trim(),
                        amount: amount,
                        order: index,
                        airdropId: result[0].airdropId
                    }
                });
                await claimService.createClaims(claims, { session });
            });

            const responseBody = new ResponseBody("Airdrop successfully created", false, airdrop);
            responseHandler(res, next, responseBody, 201);
        } catch (error) {
            logger.error(`${error}`);
            throw new ErrorBody(409, "Failed to create Airdrop", []);
        } finally {
            session.endSession();
        }

    } catch (error) {
        next(error);
    }
}


exports.getMerkleRoot = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        const { airdropObjectId } = req.query;

        const airdrop = await airdropService.findAirdropById(airdropObjectId, "airdropId totalRecipients totalTokens", { lean: true });

        if (!airdrop) {
            const responseBody = new ResponseBody("Airdrop not found", true, { airdropObjectId });
            return responseHandler(res, next, responseBody, 200);
        }

        const claims = await claimService.findclaimsWithFilters({ airdropId: airdrop.airdropId }, "-_id airdropId order address amount", { sort: { order: 1 }, lean: true });

        if (!claims || claims.length == 0 || claims.length !== airdrop.totalRecipients) {
            const responseBody = new ResponseBody("Airdrop data mismatched", true, { airdropObjectId });
            return responseHandler(res, next, responseBody, 200);
        } else {

            const calculatedAmount = claims.reduce((sum, { amount }) => {
                return sum + amount;
            }, 0)

            if (calculatedAmount !== airdrop.totalTokens) {
                const responseBody = new ResponseBody("Airdrop data mismatched", true, { airdropObjectId });
                return responseHandler(res, next, responseBody, 200);
            }

            let airdropIdHex = Web3.utils.numberToHex(airdrop.airdropId);
            airdropIdHex = Web3.utils.padLeft(airdropIdHex, 64);

            let recipients = claims.map(({ amount, order, address }) => {
                const calcAmount = Web3.utils.toWei(amount, 'ether');
                return { amount: calcAmount, airdropId: airdropIdHex, proofIndex: order, address: address }
            });
            const { root } = await merkleTreeService.buildMerkleTree(recipients);

            const data = {
                airdropId: airdropIdHex,
                merkleRoot: root,
                totalCount: airdrop.totalRecipients,
                totalTokens: Web3.utils.toWei(airdrop.totalTokens, 'ether')
            }
            const responseBody = new ResponseBody("Airdrop merkleroot retrieved", false, data);
            responseHandler(res, next, responseBody, 200);
        }

    } catch (error) {
        next(error);
    }
}

exports.getMerkleProof = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        const { claimObjectId } = req.query;

        const claim = await claimService.findclaimById(claimObjectId, "_id airdropId order address amount", { lean: true });

        if (!claim) {
            const responseBody = new ResponseBody("Claim not found", true, { claimObjectId });
            return responseHandler(res, next, responseBody, 200);
        }

        const airdrop = await airdropService.findAirdropWithFilters({ airdropId: claim.airdropId }, "airdropId totalRecipients totalTokens", { lean: true });

        if (!airdrop) {
            const responseBody = new ResponseBody("Airdrop not found", true, { claimObjectId });
            return responseHandler(res, next, responseBody, 200);
        }

        const claims = await claimService.findclaimsWithFilters({ airdropId: airdrop.airdropId }, "-_id airdropId order address amount", { sort: { order: 1 }, lean: true });

        if (!claims || claims.length == 0 || claims.length !== airdrop.totalRecipients) {
            const responseBody = new ResponseBody("Airdrop data mismatched", true, { claimObjectId });
            return responseHandler(res, next, responseBody, 200);
        } else {
            const calculatedAmount = claims.reduce((sum, { amount }) => {
                return sum + amount;
            }, 0)
            if (calculatedAmount !== airdrop.totalTokens) {
                const responseBody = new ResponseBody("Airdrop data mismatched", true, { claimObjectId });
                return responseHandler(res, next, responseBody, 200);
            }

            let airdropIdHex = Web3.utils.numberToHex(airdrop.airdropId);
            airdropIdHex = Web3.utils.padLeft(airdropIdHex, 64);

            let recipients = claims.map(({ amount, order, address }) => {
                const calcAmount = Web3.utils.toWei(amount, 'ether');
                return { amount: calcAmount, airdropId: airdropIdHex, proofIndex: order, address: address }
            });

            const { tree } = await merkleTreeService.buildMerkleTree(recipients);

            const claimAmount = Web3.utils.toWei(claim.amount, 'ether');
            const { proof } = await merkleTreeService.generateMerkleProof(tree, claim.address, claimAmount, claim.order, airdropIdHex);

            const data = {
                airdropId: airdropIdHex,
                amount: claimAmount,
                proofIndex: claim.order,
                proof: proof
            }
            const responseBody = new ResponseBody("Airdrop merkleprood retrieved", false, data);
            responseHandler(res, next, responseBody, 200);
        }

    } catch (error) {
        next(error);
    }
}


exports.getAirdrop = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        const { airdropId } = req.query;

        const result = await airdropService.findAirdropWithFilters({ airdropId }, "_id airdropId totalRecipients totalTokens isCreated createdAt updatedAt", { lean: true });
        let responseBody;
        if (result) {
            responseBody = new ResponseBody("Airdrop successfully retrieved", false, result);
        }
        else {
            responseBody = new ResponseBody("Airdrop not found", true, {});
        }
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}

exports.getAirdrops = async (req, res, next) => {
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
        const result = await airdropService.getAirdrops(options);
        let data = {
            records: result[0]?.data || [],
            maxRecords: result[0]?.maxRecords || 0
        }
        const responseBody = new ResponseBody("Airdrops successfully retrieved", false, data);
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}

exports.markAirdropAsCreated = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        const { airdropId } = req.body;
        const result = await airdropService.findAirdropAndUpdate({ airdropId: airdropId, isCreated: false }, { isCreated: true });

        let responseBody;
        if (result) {
            const result2 = await claimService.findclaimsAndUpdate({ airdropId: airdropId, isCreated: false }, { isCreated: true });
            if (result2) {
                responseBody = new ResponseBody("Airdrop successfully marked as created", false, {});
                return responseHandler(res, next, responseBody, 200);
            }
        }
        responseBody = new ResponseBody("Airdrop not found or already marked as created", true, {});
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}

exports.getAllClaims = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        const { airdropId } = req.query;
        const result = await claimService.findclaimsWithFilters({ airdropId: airdropId }, "", { sort: { order: 1 }, lean: true });
        const responseBody = new ResponseBody("Claims successfully retrieved", false, { claims: result });
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}

exports.getUserClaims = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorBody(400, "Bad Input", errors.array());
        }
        const { address } = req.query;
        const result = await claimService.findclaimsWithFilters({ address: address, isCreated: true }, "", { sort: { airdropId: -1 }, lean: true });
        const responseBody = new ResponseBody("Claims successfully retrieved", false, { claims: result });
        responseHandler(res, next, responseBody, 200);
    } catch (error) {
        next(error);
    }
}