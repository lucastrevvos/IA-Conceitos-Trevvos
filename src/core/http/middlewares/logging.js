import { logger } from "../../logger.js";

export function logging(req, res, next) {
  const start = Date.now();

  logger.info("HTTP request iniciado", {
    method: req.method,
    url: req.originalUrl,
    requestId: req.requestId,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info("HTTP request finalizado", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      requestId: req.requestId,
    });
  });

  next();
}
