import { processUploadedFile } from "../../services/files/fileTextService.js";

export const uploadController = {
  async handleDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Nenhum arquivo enviado. Use o campo 'file' no formulário",
        });
      }

      const {
        filename,
        originalname,
        mimetype,
        size,
        path: filePath,
      } = req.file;

      const { rawText, sanitizedText, chunks } = await processUploadedFile({
        path: filePath,
        mimetype,
      });

      const preview = sanitizedText.slice(0, 800);

      return res.json({
        message: "Upload e processamento realizados com sucesso.",
        file: {
          filename,
          originalname,
          mimetype,
          size,
          path: filePath,
        },
        textInfo: {
          lengthRaw: rawText.length,
          lengthSanitized: sanitizedText.length,
          preview,
          chunksCount: chunks.length,
        },
        requestId: req.requestId,
      });
    } catch (error) {
      return next(error);
    }
  },
};
