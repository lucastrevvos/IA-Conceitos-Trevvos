import "dotenv/config";

const requiredVars = ["OPENAI_API_KEY"];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Variáveis de ambiente obrigatórias ausentes: ${missing.join(", ")}`,
  );
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
