import { callOpenAI } from "./openaiClient.js";

export async function simpleChat({ systemPrompt, userMessage }) {
  const messages = [
    {
      role: "system",
      content:
        systemPrompt ??
        "Você é um assistente técnico, direto, amigável, em PT-BR",
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  const reply = await callOpenAI({
    model: "gpt-4o-mini",
    input: messages,
  });

  return reply;
}
