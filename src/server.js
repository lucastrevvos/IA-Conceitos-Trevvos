import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const uploadFolder = path.resolve("uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);

    cb(null, `${base}-${timestamp}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, //10mb
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Tipo de arquivo não suportado. Envie PDF ou DOCX"));
    }

    cb(null, true);
  },
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.post("/upload/document", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "Nenhum arquivo enviado. Use o campo 'file' no formulário",
    });
  }

  const { filename, originalname, mimetype, size, path: filePath } = req.file;

  return res.json({
    message: "Upload realizado com sucesso",
    file: {
      filename,
      originalname,
      mimetype,
      size,
      path: filePath,
    },
  });
});

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

app.post("/resumo", async (req, res) => {
  const { text, sentences } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({
      error: "Campo 'text' é obrigatório e deve ser uma string",
    });
  }

  const numSentences = Number.isInteger(sentences) ? sentences : 4;

  const prompt = `
    Você receberá um texto em português.

    Resuma esse texto em aproximadamente ${numSentences} frases curtas, objetivas e bem conectadas. Não invente informação nova, apenas reorganize e compacte o contéudo.

    Texto original:
    """${text}"""
  `;

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "Você é um assistente especializado em resumir textos em português de forma clara e objetiva.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return res.json({
      summary: response.output_text,
    });
  } catch (error) {
    console.error("Erro ao chamar OpenAI em /resumo:", error);

    return res.status(500).json({
      error: "Erro interno ao gerar resumo",
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
