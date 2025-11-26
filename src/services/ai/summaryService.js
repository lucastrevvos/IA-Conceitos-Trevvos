import { callOpenAI } from "../../infra/openai/openaiClient.js";

export async function summarizeText({ text, sentences = 4 }) {
  const prompt = `
Você receberá um texto em português.

Resuma esse texto em aproximadamente ${sentences} frases curtas, objetivas e bem conectadas. 
Não invente informação nova, apenas reorganize e compacte o conteúdo.

Texto original:
"""${text}"""
`;

  const messages = [
    {
      role: "system",
      content:
        "Você é um assistente especializado em resumir textos em português de forma clara e objetiva.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const summary = await callOpenAI({
    model: "gpt-4o-mini",
    input: messages,
  });

  return summary;
}
