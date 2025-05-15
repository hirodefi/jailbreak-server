const { Web3 } = require("web3");


const AIRDROP_CONTRACT_ADDRESS = process.env.AIRDROP_CONTRACT_ADDRESS; // Replace with your contract address
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const INFURA_HTTP_URL = process.env.INFURA_HTTP_URL; // Your Infura http URL

const abi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "airdropId",
                "type": "bytes32"
            }
        ],
        "name": "AirdropCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "airdropId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "merkleRoot",
                "type": "bytes32"
            }
        ],
        "name": "AirdropCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "airdropId",
                "type": "bytes32"
            }
        ],
        "name": "ClaimedToken",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "ReceivedEther",
        "type": "event"
    },
    {
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "airdrops",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "merkleRoot",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "totalCount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "claimedCount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalTokens",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "claimedTokens",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "isActive",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "isCompleted",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "airdropId",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "proofIndex",
                "type": "uint256"
            },
            {
                "internalType": "bytes32[]",
                "name": "proof",
                "type": "bytes32[]"
            }
        ],
        "name": "claim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "airdropId",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "merkleRoot",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "totalCount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalTokens",
                "type": "uint256"
            }
        ],
        "name": "createAirdrop",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "airdropId",
                "type": "bytes32"
            }
        ],
        "name": "disableAirdrop",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "airdropId",
                "type": "bytes32"
            }
        ],
        "name": "enableAirdrop",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "airdropId",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getClaimedBitmap",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]


// ADMIN

const airdropAdminWeb3 = new Web3(INFURA_HTTP_URL);

const airdropAdminAccount = airdropAdminWeb3.eth.accounts.privateKeyToAccount(ADMIN_PRIVATE_KEY);
airdropAdminWeb3.eth.accounts.wallet.add(airdropAdminAccount);
airdropAdminWeb3.eth.defaultAccount = airdropAdminAccount.address;


const airdropAdminContract = new airdropAdminWeb3.eth.Contract(abi, AIRDROP_CONTRACT_ADDRESS);



module.exports = {
    airdropAdminContract,
    airdropAdminAccount,
    airdropAdminWeb3
}
