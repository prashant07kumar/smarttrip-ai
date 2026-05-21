function extractFirstJsonArrayChunk(text: string): string | null {
  const match = text.match(/\[[\s\S]*?\]/m);
  return match?.[0]?.trim() ?? null;
}

function extractFirstJsonChunk(text: string): string | null {
  const match = text.match(/({[\s\S]*}|\[[\s\S]*\])/m);
  return match?.[0]?.trim() ?? null;
}

function normalizeJsonText(text: string): string {
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*([}\]])/g, '$1')
    .trim();
}

export function cleanAIJsonMessage(raw: string): string {
  const text = String(raw ?? '').trim();
  if (!text) {
    return '';
  }

  let cleaned = text;

  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1]) {
    cleaned = fenceMatch[1].trim();
  }

  const inlineMatch = cleaned.match(/^`(?:json\s*)?([\s\S]*?)`$/i);
  if (inlineMatch?.[1]) {
    cleaned = inlineMatch[1].trim();
  }

  cleaned = cleaned.replace(/^[\s\r\n]*(?:here is|here's|output|result|response|json)\s*[:\-]?\s*/i, '').trim();

  const extractedArray = extractFirstJsonArrayChunk(cleaned) ?? extractFirstJsonArrayChunk(text);
  if (extractedArray) {
    cleaned = extractedArray;
  } else {
    const extracted = extractFirstJsonChunk(cleaned);
    if (extracted) {
      cleaned = extracted;
    }
  }

  return cleaned;
}

export function tryParseSafeJson<T = unknown>(raw: string): T | null {
  const cleaned = cleanAIJsonMessage(raw);
  if (!cleaned) {
    return null;
  }

  const candidates = [cleaned, normalizeJsonText(cleaned)];
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // continue
    }
  }

  const arrayChunk = extractFirstJsonArrayChunk(raw) ?? extractFirstJsonArrayChunk(cleaned);
  if (arrayChunk) {
    const normalized = normalizeJsonText(arrayChunk);
    try {
      return JSON.parse(normalized) as T;
    } catch {
      // continue
    }
  }

  const chunk = extractFirstJsonChunk(raw) ?? extractFirstJsonChunk(cleaned);
  if (chunk && chunk !== cleaned) {
    const normalized = normalizeJsonText(chunk);
    try {
      return JSON.parse(normalized) as T;
    } catch {
      // continue
    }
  }

  return null;
}
