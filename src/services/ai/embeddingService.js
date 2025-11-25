import OpenAI from "openai";
import { env } from "../../core/config/env.js";
import { logger } from "../../core/logger.js";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const EMBEDDING_MODEL = "text-embedding-3-small";

export async function embedTextBatch(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  logger.info("Gerando embeddings", {
    model: EMBEDDING_MODEL,
    count: texts.length,
  });

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}
