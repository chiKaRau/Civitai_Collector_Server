const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

exports.runCompletion = async () => {
    try {
        const completion = await openai.createCompletion({
            model: "gpt-3.5-turbo",
            prompt: "How are you today?",
            max_tokens: 4000
        });
        console.log(completion.data.choices[0].text);
    } catch (err) {
        console.error(err)
    }
}

