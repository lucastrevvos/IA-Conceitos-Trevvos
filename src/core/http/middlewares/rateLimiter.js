const buckets = new Map();

/**
 * Rate limit simples por IP + rota.
 *
 * maxRequests: máximo de reqs por janela
 * windowMs: tamanho da janela em ms
 */

export function createRateLimiter({ maxRequests, windowMs }) {
  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const key = `${ip}:${req.baseUrl}${req.path}`;

    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > maxRequests) {
      return res.status(429).json({
        error: "Muitas requisições. Tente novamente em instantes.",
      });
    }

    res.setHeader("x-rate-limit-remaining", String(maxRequests - bucket.count));
    res.setHeader("x-rate-limit-reset", new Date(bucket.resetAt).toISOString());

    next();
  };
}
