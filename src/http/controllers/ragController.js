import { answerWithRag } from "../../services/ai/ragService.js";

export const ragController = {
  async query(req, res, next) {
    try {
      const { question, limit } = req.body;

      if (!question || typeof question !== "string") {
        return res.status(400).json({
          error: "Campo 'question' é obrigatório e deve ser uma string",
        });
      }

      const parsedLimit =
        Number.isInteger(limit) && limit > 0 && limit <= 20 ? limit : 5;

      const { answer, usedChunks } = await answerWithRag({
        question,
        limit: parsedLimit,
      });

      return res.json({
        answer,
        usedChunks,
        requestId: req.requestId,
      });
    } catch (error) {
      return next(error);
    }
  },
};
