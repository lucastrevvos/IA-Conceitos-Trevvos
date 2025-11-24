export function sanitizeText(text) {
  if (!text) return "";

  let result = text;

  // CPF: 000.000.000-00 ou 00000000000
  result = result.replace(
    /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
    "***CPF_MASKED***",
  );

  // CNPJ: 00.000.000/0000-00 ou 00000000000000
  result = result.replace(
    /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
    "***CNPJ_MASKED***",
  );

  // E-mail
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "***EMAIL_MASKED***",
  );

  result = result.replace(
    /\b(\+?\d{1,3}\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/g,
    "***PHONE_MASKED***",
  );

  return result;
}
