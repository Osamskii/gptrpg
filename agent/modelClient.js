import { Configuration, OpenAIApi } from "openai";
import http from "http";
import https from "https";
import { URL } from "url";
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

  const url = new URL(env.LM_STUDIO_URL);
  const transport = url.protocol === "https:" ? https : http;

  const requestBody = JSON.stringify({
    messages: [{ role: "user", content: prompt }],
    stream: false,
  });

  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };

  const responseText = await new Promise((resolve, reject) => {
    const req = transport.request(options, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.write(requestBody);
    req.end();
  });

  const parsed = JSON.parse(responseText);
  return parsed.choices[0].message.content;
}
