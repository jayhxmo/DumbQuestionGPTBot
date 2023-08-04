const TelegramBot = require("node-telegram-bot-api");
const { Configuration, OpenAIApi } = require("openai");

module.exports = async (request, response) => {
  try {
    const bot = new TelegramBot(process.env.botToken);

    const { body } = request;

    if (body.message) {
      const {
        chat: { id },
        text,
      } = body.message;

      if (text.includes("@DumbQuestionGPTBot")) {
        const question = text.replace("@DumbQuestionGPTBot", "").trim();

        // GPT the response
        const configuration = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const chatCompletion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Concisely in simple terms. Answer the question in logical bullet points. You can write in markdown, so feel free to bold or italicize important words. Do not add any phrases like "Sure! Here are the ...". Be concise like you're talking to a CEO. Here is the question: ${question}`,
            },
          ],
        });

        const message = chatCompletion.data.choices[0].message?.content;

        await bot.sendMessage(id, message, { parse_mode: "Markdown" });
      }
    }
  } catch (error) {
    console.error("Error sending message");
    console.log(error.toString());
  }

  response.send(200);
};
