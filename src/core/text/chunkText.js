/**
 * Divide o texto em pedaços menores (por caracteres) respeitando quebras de linha quando possível.
 * Isso é um protótipo simples para preparar RAG depois.
 */
export function chunkText(text, maxChars = 4000) {
  if (!text) return [];

  const chunks = [];
  let current = "";

  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    // +1 por causa do \n
    if (current.length + line.length + 1 > maxChars) {
      if (current.trim().length > 0) {
        chunks.push(current.trim());
      }
      current = line + "\n";
    } else {
      current += line + "\n";
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks;
}
