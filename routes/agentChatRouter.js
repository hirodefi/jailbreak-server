const router = require('express').Router();
const { agentChatController } = require("../controllers");
const { body, query } = require('express-validator');
const { verifyAdmin, verifyUser } = require("../middlewares");


const createAgentChatValidator = [
    body("agentId").isNumeric(),
    body("message").trim().notEmpty().toLowerCase()
];

const agentChatsQueryValidator = [
    query("agentId").isNumeric().custom(val => val > 0),
];

const agentChatSummaryAdminQueryValidator = [
    query("agentId").isNumeric().custom(val => val > 0),
];

router.post("/", verifyUser, createAgentChatValidator, agentChatController.createAgentTempChat);
router.get("/all", agentChatsQueryValidator, agentChatController.getAgentChats);




router.get("/admin/summary", verifyAdmin, agentChatSummaryAdminQueryValidator, agentChatController.getAdminAgentChatSummary);





module.exports = router;

