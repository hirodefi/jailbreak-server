const { openAIConfig: { openai } } = require("../configs")


exports.chatWithGpt = async (messages = []) => {
    return await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
    });
}