import { logger } from "../../logger.js";

export function errorHandler(err, req, res, next) {
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
