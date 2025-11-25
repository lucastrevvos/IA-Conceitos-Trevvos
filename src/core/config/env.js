import "dotenv/config";

const requiredVars = ["OPENAI_API_KEY", "DATABASE_URL"];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Variáveis de ambiente obrigatórias ausentes: ${missing.join(", ")}`,
  );
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
};
