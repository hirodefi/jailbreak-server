const router = require('express').Router();
const { verifyAdmin } = require("../middlewares");
const { airdropController } = require("../controllers");
const { body, query } = require('express-validator');
const { validator } = require('web3-validator');
const Web3 = require("web3");



const airdropBodyValidator = [
    body('recipients').isArray({ min: 1, max: 256 }).custom((recipients, { req }) => {
        const flag = recipients.every(({ address, amount }) => {
            if (address && amount > 0) {
                const errors = validator.validate(['address', 'uint256'], [address, Web3.utils.toWei(amount, 'ether')], { silent: true });
                if (!errors) {
                    return true;
                }
            }
            return false;
        });
        if (flag) {
            return true;
        }
        return false;
    }),
    body("totalCount").isNumeric().custom(val => val > 0),
    body("totalAmount").isNumeric().custom(val => val > 0),
];

const merkleRootQueryValidator = [
    query("airdropObjectId").isMongoId()
];

const merkleProofQueryValidator = [
    query("claimObjectId").isMongoId()
];

const airdropQueryValidator = [
    query("airdropId").isNumeric().custom(val => val > 0)
];

const airdropsQueryValidator = [
    query("page").optional({ checkFalsy: true }).custom(val => val >= 0),
    query("size").optional({ checkFalsy: true }).custom(val => val > 0),
];

const airdropUpdateBodyValidator = [
    body("airdropId").isNumeric().custom(val => val > 0)
];

const getClaimsQueryValidator = [
    query("airdropId").isNumeric().custom(val => val > 0)
];

const getUserClaimsQueryValidator = [
    query("address").trim().notEmpty().toLowerCase()
];


router.post("/admin", verifyAdmin, airdropBodyValidator, airdropController.createAirdrop);

router.get("/admin/merkleRoot", verifyAdmin, merkleRootQueryValidator, airdropController.getMerkleRoot);

router.get("/admin", verifyAdmin, airdropQueryValidator, airdropController.getAirdrop);

router.get("/admin/all", verifyAdmin, airdropsQueryValidator, airdropController.getAirdrops);

router.put("/admin", verifyAdmin, airdropUpdateBodyValidator, airdropController.markAirdropAsCreated);

router.get("/admin/claim/all", verifyAdmin, getClaimsQueryValidator, airdropController.getAllClaims);



router.get("/claim/all", getUserClaimsQueryValidator, airdropController.getUserClaims);

router.get("/merkleProof", merkleProofQueryValidator, airdropController.getMerkleProof);






module.exports = router;

