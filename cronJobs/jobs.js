const { agentWeb3Config: { AgentAdminAccount, agentAdminContract, agentAdminWeb3 }, airdropWeb3Config: { airdropAdminAccount, airdropAdminContract, airdropAdminWeb3 } } = require("../configs");
const { agentService, airdropService, claimService, merkleTreeService, agentChatService } = require("../services");
const moment = require("moment");
const mongoose = require("mongoose");
const Web3 = require('web3');


exports.closeBrokenAgents = async () => {
    try {
        const unClosedAgents = await agentService.findAgentsWithFilters({ isCreated: true, isOver: true, endTime: 0, winner: { $ne: "" } }, "", { lean: true });

        for (let agent of unClosedAgents) {

            console.log(`Closing Broken agents started: ${agent.agentId}`);

            try {
                let agentId = agent.agentId;
                let agentIdHex = Web3.utils.numberToHex(agentId);
                agentIdHex = Web3.utils.padLeft(agentIdHex, 64);
                let userAddress = agent.winner;
                let count = agent.breakAttempts;
                let tokenAmount = agent.tokenAmount;
                let winnerPrize = agent.winnerPrize; // in ether

                const gasEstimate = await agentAdminContract.methods.completeAgent(agentIdHex, userAddress).estimateGas({ from: AgentAdminAccount.address });
                const currentGasPrice = await agentAdminWeb3.eth.getGasPrice();
                const priorityFee = Web3.utils.toWei('3', 'gwei');
                const totalGasPrice = currentGasPrice + BigInt(priorityFee);

                const tx = await agentAdminContract.methods
                    .completeAgent(agentIdHex, userAddress)
                    .send({
                        from: AgentAdminAccount.address,
                        gas: gasEstimate.toString(),
                        gasPrice: totalGasPrice.toString(),
                    });


                if (tx && tx.events && tx.events.AgentCompleted) {
                    const event = tx.events.AgentCompleted.returnValues;
                    await agentService.findAgentAndUpdate({ agentId: agentId, isOver: true }, { endTime: parseInt(event.endTime) });
                }

                console.log(`Agent: ${agent.agentId} mark as completed on-chain`);

                //create airdrop


                let latestAirdrop = await airdropService.findAirdropWithFilters({}, 'airdropId', { sort: { airdropId: -1 }, lean: true });
                const airdropId = latestAirdrop ? latestAirdrop.airdropId + 1 : 1;

                const totalAmount = (count * tokenAmount) + winnerPrize; // ether
                const totalRecipients = 1;
                let success = false;
                let session;

                try {
                    const airdrop = {
                        airdropId: airdropId,
                        totalRecipients: totalRecipients,
                        totalTokens: totalAmount
                    }

                    session = await mongoose.startSession();

                    await session.withTransaction(async () => {
                        await airdropService.createSessionAirdrop(airdrop, { session });
                        const claims = [{
                            address: userAddress,
                            amount: totalAmount,
                            order: 0,
                            airdropId: airdropId
                        }]
                        await claimService.createClaims(claims, { session });
                        await agentService.findAgentAndUpdate({ agentId: agentId, isOver: true }, { airdropId: airdropId });
                    });
                    success = true;
                    console.log(`Agent: ${agent.agentId} airdrop data created offchain-db with airdropId ${airdropId}`);

                } catch (error) {
                    console.log(error);
                } finally {
                    session.endSession();
                }

                if (success) {
                    try {

                        // do actual contract airdrop txn

                        let airdropIdHex = Web3.utils.numberToHex(airdropId);
                        airdropIdHex = Web3.utils.padLeft(airdropIdHex, 64);
                        const totalAmountToWei = Web3.utils.toWei(totalAmount, 'ether');

                        const { root } = await merkleTreeService.buildMerkleTree([{ address: userAddress, amount: totalAmountToWei, proofIndex: 0, airdropId: airdropIdHex }]);

                        const gasEstimate = await airdropAdminContract.methods.createAirdrop(airdropIdHex, root, totalRecipients, totalAmountToWei).estimateGas({ from: airdropAdminAccount.address });
                        const currentGasPrice = await airdropAdminWeb3.eth.getGasPrice();
                        const priorityFee = Web3.utils.toWei('3', 'gwei');
                        const totalGasPrice = currentGasPrice + BigInt(priorityFee);

                        await airdropAdminContract.methods
                            .createAirdrop(airdropIdHex, root, totalRecipients, totalAmountToWei)
                            .send({
                                from: airdropAdminAccount.address,
                                gas: gasEstimate.toString(),
                                gasPrice: totalGasPrice.toString(),
                            });

                        console.log(`Agent: ${agent.agentId} airdrop created onchain with airdropId ${airdropId}`);

                        // mark airdrop as created 

                        const airdropResult = await airdropService.findAirdropAndUpdate({ airdropId: airdropId, isCreated: false }, { isCreated: true });
                        if (airdropResult) {
                            await claimService.findclaimsAndUpdate({ airdropId: airdropId, isCreated: false }, { isCreated: true });
                            console.log(`Agent: ${agent.agentId} airdrop marked as created on offchain-DB with airdropId ${airdropId}`);
                        }

                    } catch (error) {
                        console.log(error)
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }

    } catch (error) {
        console.log(error);
    }
};



exports.closeExpiredAgents = async () => {
    try {

        const uinxTime = moment().unix();
        const expriedAgents = await agentService.findAgentsWithFilters({ isCreated: true, isOver: false, endTime: 0, winner: "", maxEndTime: { $lte: uinxTime } }, "", { lean: true });

        for (let agent of expriedAgents) {
            console.log(`Closing Expired agents started: ${agent.agentId}`);

            try {
                let agentId = agent.agentId;
                let agentIdHex = Web3.utils.numberToHex(agentId);
                agentIdHex = Web3.utils.padLeft(agentIdHex, 64);
                let userAddress = '0x0000000000000000000000000000000000000000';
                let count = agent.breakAttempts;
                let tokenAmount = agent.tokenAmount;

                const gasEstimate = await agentAdminContract.methods.completeAgent(agentIdHex, userAddress).estimateGas({ from: AgentAdminAccount.address });
                const currentGasPrice = await agentAdminWeb3.eth.getGasPrice();
                const priorityFee = Web3.utils.toWei('3', 'gwei');
                const totalGasPrice = currentGasPrice + BigInt(priorityFee);

                const tx = await agentAdminContract.methods
                    .completeAgent(agentIdHex, userAddress)
                    .send({
                        from: AgentAdminAccount.address,
                        gas: gasEstimate.toString(),
                        gasPrice: totalGasPrice.toString(),
                    });

                let updateQuery = {
                    isOver: true
                }
                if (tx && tx.events && tx.events.AgentCompleted) {
                    const event = tx.events.AgentCompleted.returnValues;
                    updateQuery["endTime"] = event.endTime ? parseInt(event.endTime) : uinxTime;
                }
                await agentService.findAgentAndUpdate({ agentId: agentId, isOver: false }, updateQuery);

                console.log(`Agent: ${agent.agentId} marked as completed on-chain`);


                //create airdrop

                let latestAirdrop = await airdropService.findAirdropWithFilters({}, 'airdropId', { sort: { airdropId: -1 }, lean: true });
                const airdropId = latestAirdrop ? latestAirdrop.airdropId + 1 : 1;

                let recipients = await agentChatService.getAgentChatSummary({ agentId: agentId });

                let claims = recipients.map(({ senderAddress, attempts }, index) => {
                    return {
                        address: senderAddress,
                        amount: attempts * tokenAmount,
                        order: index,
                        airdropId: airdropId
                    }
                });

                const totalAmount = claims.reduce((sum, { amount }) => {
                    return sum + amount;
                }, 0);

                const totalRecipients = claims.length;



                let success = false;
                let session;

                try {
                    const airdrop = {
                        airdropId: airdropId,
                        totalRecipients: totalRecipients,
                        totalTokens: totalAmount
                    }

                    session = await mongoose.startSession();

                    await session.withTransaction(async () => {
                        await airdropService.createSessionAirdrop(airdrop, { session });
                        await claimService.createClaims(claims, { session });
                        await agentService.findAgentAndUpdate({ agentId: agentId, isOver: true }, { airdropId: airdropId });
                    });
                    success = true;
                    console.log(`Agent: ${agent.agentId} airdrop data created offchain-db with airdropId ${airdropId}`);

                } catch (error) {
                    console.log(error);
                } finally {
                    session.endSession();
                }

                if (success) {
                    try {

                        // do actual contract airdrop txn

                        let airdropIdHex = Web3.utils.numberToHex(airdropId);
                        airdropIdHex = Web3.utils.padLeft(airdropIdHex, 64);

                        const mekleData = claims.map(({ address, amount, order, airdropId }) => {
                            return {
                                address: address,
                                amount: Web3.utils.toWei(amount, 'ether'),
                                proofIndex: order,
                                airdropId: airdropIdHex
                            }
                        });

                        const { root } = await merkleTreeService.buildMerkleTree(mekleData);

                        const totalAmountToWei = Web3.utils.toWei(totalAmount, 'ether');

                        const gasEstimate = await airdropAdminContract.methods.createAirdrop(airdropIdHex, root, totalRecipients, totalAmountToWei).estimateGas({ from: airdropAdminAccount.address });
                        const currentGasPrice = await airdropAdminWeb3.eth.getGasPrice();
                        const priorityFee = Web3.utils.toWei('3', 'gwei');
                        const totalGasPrice = currentGasPrice + BigInt(priorityFee);

                        await airdropAdminContract.methods
                            .createAirdrop(airdropIdHex, root, totalRecipients, totalAmountToWei)
                            .send({
                                from: airdropAdminAccount.address,
                                gas: gasEstimate.toString(),
                                gasPrice: totalGasPrice.toString(),
                            });

                        console.log(`Agent: ${agent.agentId} airdrop created onchain with airdropId ${airdropId}`);

                        // mark airdrop as created 

                        const airdropResult = await airdropService.findAirdropAndUpdate({ airdropId: airdropId, isCreated: false }, { isCreated: true });
                        if (airdropResult) {
                            await claimService.findclaimsAndUpdate({ airdropId: airdropId, isCreated: false }, { isCreated: true });
                            console.log(`Agent: ${agent.agentId} airdrop marked as created on offchain-DB with airdropId ${airdropId}`);
                        }

                    } catch (error) {
                        console.log(error)
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }

    } catch (error) {
        console.log(error);
    }
};