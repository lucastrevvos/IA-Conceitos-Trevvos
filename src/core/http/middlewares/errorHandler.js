import multer from "multer";
import { logger } from "../../logger.js";

export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    logger.warn("Erro de upload (Multer)", {
      error: err.message,
      code: err.code,
      requestId: req.requestId,
    });

    return res.status(400).json({
      error: "Erro no upload do arquivo",
      details: err.message,
      requestId: req.requestId,
    });
  }

  if (err?.message === "Tipo de arquivo não suportado. Envie PDF ou DOCX") {
    logger.warn("Upload com tipo de arquivo não suportado", {
      requestId: req.requestId,
    });
  }

  logger.error("Erro não tratado", {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
    url: req.originalUrl,
  });

  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;

  return res.status(status).json({
    error: "Erro interno no servidor.",
    requestId: req.requestId,
  });
}
