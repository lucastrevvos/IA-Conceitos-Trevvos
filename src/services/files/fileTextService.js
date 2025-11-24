// src/services/files/fileTextService.js
import fs from "node:fs/promises";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import { sanitizeText } from "../../core/text/sanitize.js";
import { chunkText } from "../../core/text/chunkText.js";

async function extractPdfText(filePath) {
  const fileBuffer = await fs.readFile(filePath);
  const pdfData = new Uint8Array(fileBuffer);

  const pdfDoc = await pdfjsLib.getDocument({
    data: pdfData,
    // dá esses warnings de standardFontDataUrl, mas funciona.
    // depois a gente pode configurar isso bonito, se quiser.
  }).promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}

async function extractDocxText(filePath) {
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

async function extractTextFromFile(filePath, mimetype) {
  if (mimetype === "application/pdf") {
    return extractPdfText(filePath);
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(filePath);
  }

  throw new Error(
    `Tipo de arquivo não suportado para extração de texto: ${mimetype}`,
  );
}

/**
 * Mantém a MESMA assinatura que o controller espera:
 * processUploadedFile({ path, mimetype }) -> { rawText, sanitizedText, chunks }
 */
export async function processUploadedFile({ path, mimetype }) {
  const rawText = await extractTextFromFile(path, mimetype);

  // normaliza um pouco o texto
  const normalized = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const sanitizedText = sanitizeText(normalized);
  const chunks = chunkText(sanitizedText, 4000);

  return {
    rawText,
    sanitizedText,
    chunks,
  };
}
