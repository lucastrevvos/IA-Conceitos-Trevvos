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

export async function conversationChat({
  systemPrompt,
  history = [],
  userMessage,
}) {
  const baseSystem =
    systemPrompt ??
    "Você é um assistente técnico, direto, amigável, em PT-BR, ajudando um dev a construir uma API de IA em ambiente enterprise.";

  const safeHistory = Array.isArray(history) ? history : [];

  const formattedHistory = safeHistory
    .filter(
      (msg) =>
        msg && typeof msg.role === "string" && typeof msg.content === "string",
    )
    .map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

  const messages = [
    { role: "system", content: baseSystem },
    ...formattedHistory,
    { role: "user", content: userMessage },
  ];

  const reply = await callOpenAI({
    model: "gpt-4o-mini",
    input: messages,
  });

  return {
    reply,
    usedHistory: formattedHistory,
  };
}
