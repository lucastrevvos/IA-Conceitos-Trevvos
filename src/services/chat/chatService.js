import { pool } from "../../infra/db/pgClient.js";
import { findRelevantChunks } from "../ai/ragService.js";
import { callOpenAI } from "../../infra/openai/openaiClient.js";

export async function createSession({ documentId }) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
        INSERT INTO chat_sessions (document_id)
        VALUES ($1)
        RETURNING id
      `,
      [documentId || null],
    );

    return result.rows[0].id;
  } finally {
    client.release();
  }
}

export async function getSessionHistory(sessionId) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
        SELECT role, content
        FROM chat_messages
        WHERE session_id = $1
        ORDER BY created_at ASC
      `,
      [sessionId],
    );

    return result.rows;
  } finally {
    client.release();
  }
}

export async function saveMessage({ sessionId, role, content }) {
  const client = await pool.connect();

  try {
    await client.query(
      `
        INSERT INTO chat_messages (session_id, role, content)
        VALUES ($1, $2, $3)
      `,
      [sessionId, role, content],
    );
  } finally {
    client.release();
  }
}

export async function chatAssistant({ sessionId, message }) {
  // 1) Carrega histórico da sessão
  const history = await getSessionHistory(sessionId);

  // 2) Descobre se essa sessão está ligada a um documento
  const docId = await getSessionDocumentId(sessionId);

  let contextChunks = [];

  // 3) Se tiver documento, busca os chunks relevantes (RAG)
  if (docId) {
    contextChunks = await findRelevantChunks({
      query: message,
      documentId: docId,
      limit: 4,
    });
  }

  // 4) Monta mensagens para a IA
  const messages = [
    {
      role: "system",
      content:
        "Você é um assistente inteligente Trevvos com acesso a documentos internos.",
    },
    ...history.map((h) => ({
      role: h.role,
      content: h.content,
    })),
    contextChunks.length
      ? {
          role: "assistant",
          content:
            "Contexto relevante a partir dos documentos:\n\n" +
            contextChunks.map((c) => c.content).join("\n\n---\n\n"),
        }
      : null,
    {
      role: "user",
      content: message,
    },
  ].filter(Boolean); // remove o null se não tiver contexto

  // 5) Chama a OpenAI via helper centralizado
  const answer = await callOpenAI({
    model: "gpt-4o-mini",
    input: messages,
  });

  // 6) Salva mensagens no histórico
  await saveMessage({ sessionId, role: "user", content: message });
  await saveMessage({ sessionId, role: "assistant", content: answer });

  return answer;
}

async function getSessionDocumentId(sessionId) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
        SELECT document_id
        FROM chat_sessions
        WHERE id = $1
      `,
      [sessionId],
    );

    return result.rows[0]?.document_id || null;
  } finally {
    client.release();
  }
}
