import { simpleChat } from "../../services/ai/chatService";

export const chatController = {
  async handle(req, res, next) {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          error: "Campo 'message' é obrigatório e deve ser uma string",
        });
      }

      const safeHistory = Array.isArray(history) ? history : [];

      const formattedHistory = safeHistory
        .filter(
          (msg) =>
            msg &&
            typeof msg.role === "string" &&
            typeof msg.content === "string",
        )
        .map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        }));

      const systemPrompt =
        "Você é um assistente técnico, direto, amigável e em PT-BR, ajudando um dev a construir e testar uma API de IA em ambiente enterprise.";

      const messages = [
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { role: "user", content: message },
      ];

      const reply = await simpleChat({
        systemPrompt,
        userMessage: message,
      });

      return res.json({
        reply,
        usedHistory: formattedHistory,
        requestId: req.requestId,
      });
    } catch (error) {
      return next(error);
    }
  },
};
