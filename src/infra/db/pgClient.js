import pg from "pg";
import { env } from "../../core/config/env.js";
import { logger } from "../../core/logger.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on("error", (err) => {
  logger.error("Erro no pool do PostgreSQL", { error: err.message });
});
