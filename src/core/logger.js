function baseLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();

  const payload = {
    timestamp,
    level,
    message,
    ...meta,
  };

  console.log(JSON.stringify(payload));
}

export const logger = {
  info: (message, meta) => baseLog("info", message, meta),
  warn: (message, meta) => baseLog("warn", message, meta),
  error: (message, meta) => baseLog("error", message, meta),
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== "production") {
      baseLog("debug", message, meta);
    }
  },
};
