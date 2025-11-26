import { pool } from "../../infra/db/pgClient.js";
import { embedTextBatch } from "./embeddingService.js";
import { callOpenAI } from "../../infra/openai/openaiClient.js";
import { logger } from "../../core/logger.js";

export async function indexDocument({ file, chunks }) {
  if (!chunks || chunks.length === 0) {
    throw new Error("Nenhum chunck para indexar");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertDocText = `
            INSERT INTO documents (original_filename, mimetype, size)
            VALUES ($1, $2, $3)
            RETURNING id
        `;

    const docRes = await client.query(insertDocText, [
      file.originalname,
      file.mimetype,
      file.size ?? 0,
    ]);

    const documentId = docRes.rows[0].id;

    //gerar embeddings em batch
    const embeddings = await embedTextBatch(chunks);

    const insertChunkText = `
        INSERT INTO document_chunks (document_id, chunk_index, content, embedding)
        VALUES ($1, $2, $3, $4::vector)
        `;

    for (let i = 0; i < chunks.length; i++) {
      const chuck = chunks[i];
      const embedding = embeddings[i];

      // transforma o array JS em string no formato que o pgvector aceita
      const embeddingVector = `[${embedding.join(",")}]`;

      await client.query(insertChunkText, [
        documentId,
        i,
        chuck,
        embeddingVector,
      ]);
    }

    await client.query("COMMIT");

    logger.info("Documento indexado com sucesso", {
      documentId,
      chunksCount: chunks.length,
    });

    return { documentId, chunksCount: chunks.length };
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Falha ao indexar documento", { error: error.message });
    throw err;
  } finally {
    client.release();
  }
}

export async function findRelevantChunks({ question, limit = 5 }) {
  const [questionEmbedding] = await embedTextBatch([question]);

  const embeddingVector = `[${questionEmbedding.join(",")}]`;

  const query = `
    SELECT
        dc.id,
        dc.document_id,
        dc.chunk_index,
        dc.content
    FROM document_chunks dc 
    ORDER BY dc.embedding <-> $1
    LIMIT $2
  `;

  const res = await pool.query(query, [embeddingVector, limit]);

  return res.rows;
}

/**
 * Faz a pipeline RAG completa:
 *  1. busca chunks relevantes
 *  2. monta contexto
 *  3. chama OpenAI com contexto + pergunta
 */

export async function answerWithRag({ question, limit = 5 }) {
  const chunks = await findRelevantChunks({ question, limit });

  if (chunks.length === 0) {
    return {
      answer:
        "Não encontrei nada nos documentos indexados que responda à sua pergunta",
      usedChunks: [],
    };
  }

  const contextText = chunks
    .map(
      (c) =>
        `Trecho #${c.chunk_index} (doc ${c.document_id}):\n${c.content.trim()}`,
    )
    .join("\n\n---\n\n");

  const messages = [
    {
      role: "system",
      content:
        "Você é um assistente que responde APENAS com base no contexto fornecido. Se não houver informação suficiente, admita isso.",
    },
    {
      role: "user",
      content: `
    Contexto dos documentos:
    """
    ${contextText}
    """


    Pergunta do usuário:
    """${question}"""
        `.trim(),
    },
  ];

  const answer = await callOpenAI({
    model: "gpt-4o-mini",
    input: messages,
  });

  return {
    answer,
    usedChunks: chunks,
  };
}
