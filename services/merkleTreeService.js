const { MerkleTree } = require('merkletreejs');
const Web3 = require("web3");



/**
 * Create a leaf node with Solidity-style packed encoding
 */
function createLeaf(address, amount, proofIndex, airdropId) {
    // console.log(address, amount, proofIndex, airdropId, "\n")
    return Web3.utils.soliditySha3(
        { t: 'address', v: address },
        { t: 'uint256', v: amount },
        { t: 'uint256', v: proofIndex },
        { t: 'bytes32', v: airdropId }
    );
}


/**
 * Generate a Merkle tree from airdrop recipients
 * @param {Array} recipients - [{ address: address, amount: uint256, proofIndex: uint256 , airdropId:bytes32}]
 * @returns {Object} { root, tree }
 */
exports.buildMerkleTree = (recipients = []) => {
    try {
        const leaves = recipients.map(({ address, amount, proofIndex, airdropId }) =>
            Buffer.from(createLeaf(address, amount, proofIndex, airdropId).slice(2), 'hex')
        );

        const tree = new MerkleTree(leaves, Web3.utils.keccak256, { sortPairs: true });
        const root = tree.getHexRoot();
        return { tree, root };

    } catch (error) {
        console.log(error);
        throw new Error("Merkle tree creation failed");
    }
}


/**
 * Generate proof for a given recipient
 * @param {MerkleTree} tree 
 * @param {string} address 
 * @param {number} amount 
 * @param {number} proofIndex 
 * @returns {Object} { proof, leaf }
 */

exports.generateMerkleProof = (tree, address, amount, proofIndex, airdropId) => {
    try {
        const leaf = Buffer.from(
            createLeaf(address, amount, proofIndex, airdropId).slice(2),
            'hex'
        );
        const proof = tree.getHexProof(leaf);
        return { leaf: `0x${leaf.toString("hex")}`, proof };

    } catch (error) {
        throw new Error("Merkle tree creation failed");
    }
}

// let airdropIdHex = Web3.utils.numberToHex(1);
// airdropIdHex = Web3.utils.padLeft(airdropIdHex, 64);


// let recipients = [
//     { address: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2', amount: 40, proofIndex: 0 },
//     { address: '0x9876543210fedcba9876543210fedcba98765432', amount: 50, proofIndex: 1 },
//     { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', amount: 10, proofIndex: 2 },
// ];


// recipients = recipients.map(({ amount, proofIndex, address }) => {
//     const calcAmount = Web3.utils.toWei(amount, 'ether');
//     return { amount: calcAmount, airdropId: airdropIdHex, proofIndex: proofIndex, address: address }
// });

// const { tree, root } = this.buildMerkleTree(recipients);
// console.log("Merkle Root:", root);

// const proofData = this.generateMerkleProof(tree, recipients[0].address, recipients[0].amount, recipients[0].proofIndex, recipients[0].airdropId);
// console.log("Proof for recipient 1:", proofData.proof);
// console.log("Leaf hash:", proofData.leaf);


