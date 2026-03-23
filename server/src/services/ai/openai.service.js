import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';

function ensureApiKey() {
  if (!env.OPENAI_API_KEY) {
    throw new ApiError(503, 'AI_UNAVAILABLE', 'AI provider is not configured');
  }
}

export function isAiEnabled() {
  return Boolean(env.OPENAI_API_KEY);
}

async function callOpenAi(path, payload) {
  ensureApiKey();

  const response = await fetch(`https://api.openai.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(502, 'AI_PROVIDER_ERROR', `OpenAI request failed: ${text}`);
  }

  return response.json();
}

export async function createEmbedding(text) {
  const data = await callOpenAi('embeddings', {
    model: env.OPENAI_EMBEDDING_MODEL,
    input: text
  });
  return data?.data?.[0]?.embedding || null;
}

export async function generateAnswer({ question, contextChunks }) {
  const context = contextChunks
    .map((chunk, index) => `Source ${index + 1}: ${chunk.text}`)
    .join('\n\n');

  const data = await callOpenAi('chat/completions', {
    model: env.OPENAI_CHAT_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You answer customer questions using only the provided business context. If context is insufficient, say that you are not sure and ask for clarification.'
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nContext:\n${context}`
      }
    ]
  });

  return data?.choices?.[0]?.message?.content?.trim() || '';
}
