import OpenAI from "openai";
import { env } from "../../core/config/env.js";
import { logger } from "../../core/logger.js";

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function callOpenAI({
  model = "gpt-4o-mini",
  input,
  maxRetries = 2,
  timeoutMs = 8000,
}) {
  let attempt = 0;
  let lastError;

  while (attempt <= maxRetries) {
    attempt += 1;
    const attemptLabel = `${attempt}/${maxRetries + 1}`;

    try {
      logger.info("Chamando OpenAI", { attempt: attemptLabel, model });

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      const response = await client.responses.create(
        {
          model,
          input,
        },
        {
          signal: controller.signal,
        },
      );

      clearTimeout(timeout);

      const text = response.output_text ?? "";

      logger.info("OpenAI respondeu com sucesso", {
        attempt: attemptLabel,
        model,
        textLength: text.length,
      });

      return text;
    } catch (err) {
      lastError = err;

      const isAbortError =
        err.name === "AbortError" || err.message?.includes("aborted");

      logger.error("Erro ao chamar OpenAI", {
        attempt: attemptLabel,
        model,
        error: err.message,
        isAbortError,
      });

      if (attempt <= maxRetries) {
        const backoffMs = 500 * attempt;
        logger.warn("Tentando novamente chamada à OpenAI", {
          attempt: attemptLabel,
          backoffMs,
        });

        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }
      break;
    }
  }

  throw lastError;
}
