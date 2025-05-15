const router = require("express").Router();

const { ResponseBody, responseHandler } = require("../utils");


router.get("/", async (req, res, next) => {
    try {
        let responseBody = new ResponseBody("Welcome to Server", false, { status: "Success" });
        responseHandler(res, next, responseBody);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
