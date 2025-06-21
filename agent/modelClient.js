import { Configuration, OpenAIApi } from "openai";
import env from "./env.json" assert { type: "json" };

let openai;
if (env.MODEL_PROVIDER === "openai") {
  const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

export default async function callModel(prompt) {
  if (env.MODEL_PROVIDER === "openai") {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    return response.data.choices[0].message.content;
  }

  const httpResponse = await fetch(env.LM_STUDIO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });
  const data = await httpResponse.json();
  return data.choices[0].message.content;
}
