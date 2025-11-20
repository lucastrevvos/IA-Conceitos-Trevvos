import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "Campo 'message' é obrigatório e deve ser uma string.",
    });
  }

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
    {
      role: "system",
      content:
        "Você é um assistente técnico, direto, amigável e em PT-BR, ajudando um desenvolvedor a construir uma API com IA.",
    },
    ...formattedHistory,
    {
      role: "user",
      content: message,
    },
  ];

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: messages,
    });

    return res.json({
      reply: response.output_text,
      usedHistory: formattedHistory,
    });
  } catch (error) {
    console.error("Erro ao chamar OpenAI:", error);

    return res.status(500).json({
      error: "Erro interno ao chamar a IA",
      details: error.message,
    });
  }
});

app.get("/", (req, res) => {
  return res.json({
    status: "ok",
    message: "Trevvos IA API está no ar",
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
