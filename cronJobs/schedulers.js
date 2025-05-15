const cron = require('node-cron');
const jobs = require("./jobs");

cron.schedule("0 */7 * * * *", async () => {
    try {
        await jobs.closeBrokenAgents();
    } catch (error) {
        console.log(error);
    }
})


cron.schedule("0 */10 * * * *", async () => {
    try {
        await jobs.closeExpiredAgents();
    } catch (error) {
        console.log(error);
    }
})

