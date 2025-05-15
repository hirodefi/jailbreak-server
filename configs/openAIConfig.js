const OpenAI = require("openai");

const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;

const openai = new OpenAI({ apiKey: OPEN_AI_API_KEY });



module.exports = {
    openai
}
