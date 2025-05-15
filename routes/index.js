module.exports = (app) => {
    app.use("/", require("./welcomeRouter"));
    app.use("/airdrop", require("./airdropRouter"));
    app.use("/agent", require("./agentRouter"));
    app.use("/agent-chat", require("./agentChatRouter"));

}

