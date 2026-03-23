const STOP_WORDS = new Set([
  'the',
  'is',
  'a',
  'an',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'at',
  'by',
  'from',
  'as',
  'it',
  'this',
  'that',
  'your',
  'our',
  'are',
  'be',
  'what',
  'when',
  'how'
]);

function stem(token) {
  return token
    .replace(/(ing|ed|ly|es|s)$/i, '')
    .replace(/[^a-z0-9]/gi, '')
    .trim();
}

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => stem(token))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += a[i] * b[i];
  return sum;
}

function magnitude(vec) {
  return Math.sqrt(dot(vec, vec));
}

export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || !a.length || !b.length) return 0;
  if (a.length !== b.length) return 0;
  const denom = magnitude(a) * magnitude(b);
  if (!denom) return 0;
  return dot(a, b) / denom;
}

export function lexicalScore(question, text) {
  const qTokens = new Set(tokenize(question));
  if (!qTokens.size) return 0;

  const source = new Set(tokenize(text));

  let hits = 0;
  for (const token of qTokens) {
    if (source.has(token)) hits += 1;
  }
  return hits / qTokens.size;
}
