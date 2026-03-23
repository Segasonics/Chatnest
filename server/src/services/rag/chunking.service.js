export function normalizeText(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export function estimateTokenCount(text) {
  const words = normalizeText(text).split(' ').filter(Boolean).length;
  return Math.ceil(words * 1.3);
}

export function splitIntoChunks(text, options = {}) {
  const source = normalizeText(text);
  const chunkSize = options.chunkSize || 900;
  const overlap = options.overlap || 120;

  if (!source) return [];
  if (source.length <= chunkSize) return [source];

  const chunks = [];
  let start = 0;

  while (start < source.length) {
    let end = Math.min(source.length, start + chunkSize);
    if (end < source.length) {
      const boundary = source.lastIndexOf(' ', end);
      if (boundary > start + 100) end = boundary;
    }
    chunks.push(source.slice(start, end).trim());
    if (end >= source.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks.filter(Boolean);
}
