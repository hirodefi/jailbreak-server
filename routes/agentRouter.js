const router = require('express').Router();
const { agentController } = require("../controllers");
const { body, query } = require('express-validator');
const { verifyAdmin, verifyUser } = require("../middlewares");


const createAgentValidator = [
    body("task").trim().notEmpty().toLowerCase(),
    body("tokenAmount").isNumeric().custom(val => val > 0),
    body("winnerPrize").isNumeric().custom(val => val >= 0),
    body("agentTime").isNumeric().custom(val => val >= 60) //time in seconds
];

const agentsQueryValidator = [
    query("page").optional({ checkFalsy: true }).custom(val => val >= 0),
    query("size").optional({ checkFalsy: true }).custom(val => val > 0),
];

const agentQueryValidator = [
    query("agentId").isNumeric().custom(val => val > 0)
];

const agentsPublicQueryValidator = [
    query("page").optional({ checkFalsy: true }).custom(val => val >= 0),
    query("size").optional({ checkFalsy: true }).custom(val => val > 0),
];

const agentPublicQueryValidator = [
    query("agentId").isNumeric().custom(val => val > 0)
];


router.post("/admin", createAgentValidator, agentController.createAgent);

router.get("/admin/all", verifyAdmin, agentsQueryValidator, agentController.getAgents);

router.get("/admin", verifyAdmin, agentQueryValidator, agentController.getAgent);


router.get("/all", agentsPublicQueryValidator, agentController.getUserAgents);

router.get("/", agentPublicQueryValidator, agentController.getUserAgent);





module.exports = router;

