import { summarizeText } from "../../services/ai/summaryService.js";

export const summaryController = {
  async handle(req, res, next) {
    try {
      const { text, sentences } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({
          error: "Campo 'text' é obrigatório e deve ser uma string",
        });
      }

      const numSentences =
        Number.isInteger(sentences) && sentences > 0 ? sentences : 4;

      const summary = await summarizeText({
        text,
        sentences: numSentences,
      });

      return res.json({
        summary,
        requestId: req.requestId,
      });
    } catch (error) {
      return next(error);
    }
  },
};
