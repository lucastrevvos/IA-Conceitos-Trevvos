import { conversationChat, simpleChat } from "../../services/ai/chatService";

export const chatController = {
  async handle(req, res, next) {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          error: "Campo 'message' é obrigatório e deve ser uma string",
        });
      }

      const systemPrompt =
        "Você é um assistente técnico, direto, amigável e em PT-BR, ajudando um dev a construir e testar uma API de IA em ambiente enterprise.";

      const { reply, usedHistory } = await conversationChat({
        systemPrompt,
        history,
        userMessage: message,
      });

      return res.json({
        reply,
        usedHistory,
        requestId: req.requestId,
      });
    } catch (error) {
      return next(error);
    }
  },
};
