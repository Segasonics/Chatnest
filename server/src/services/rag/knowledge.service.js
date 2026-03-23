import { env } from '../../config/env.js';
import { KnowledgeDocument } from '../../models/KnowledgeDocument.js';
import { KnowledgeChunk } from '../../models/KnowledgeChunk.js';
import { splitIntoChunks, estimateTokenCount, normalizeText } from './chunking.service.js';
import { cosineSimilarity, lexicalScore } from './scoring.utils.js';
import { createEmbedding, generateAnswer, isAiEnabled } from '../ai/openai.service.js';

function fallbackAnswerFromChunks(chunks) {
  const summary = chunks
    .slice(0, 2)
    .map((item) => item.text)
    .join(' ')
    .trim();
  return summary || 'I could not find enough business information to answer right now.';
}

async function extractPdfText(buffer) {
  // Prefer pdf-parse for accurate extraction if installed.
  try {
    const mod = await import('pdf-parse');
    const parser = mod.default || mod;
    const parsed = await parser(buffer);
    return normalizeText(parsed?.text || '');
  } catch {
    // Fallback to lightweight byte scanning.
    const raw = buffer.toString('latin1');
    const matches = raw.match(/[A-Za-z0-9][A-Za-z0-9 ,./:;()\-]{20,}/g) || [];
    return normalizeText(matches.join(' '));
  }
}

export async function extractKnowledgeTextFromUpload(file) {
  if (!file?.buffer) return '';

  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    return `Image asset uploaded: ${file.originalname}. Add manual text if you want AI to answer from this image.`;
  }

  if (file.mimetype === 'application/pdf') {
    const text = await extractPdfText(file.buffer);
    return text.slice(0, 200000);
  }

  return '';
}

export async function indexKnowledgeDocument({
  workspaceId,
  title,
  text,
  sourceType = 'manual',
  sourceAssetId,
  metadata = {}
}) {
  const normalizedText = normalizeText(text);
  const chunks = splitIntoChunks(normalizedText, { chunkSize: 700, overlap: 120 }).slice(0, 150);

  const document = await KnowledgeDocument.create({
    workspaceId,
    sourceType,
    sourceAssetId,
    title,
    status: 'pending',
    contentPreview: normalizedText.slice(0, 240),
    metadata
  });

  if (!chunks.length) {
    document.status = 'failed';
    document.lastIndexedAt = new Date();
    await document.save();
    return document;
  }

  let storedCount = 0;
  for (let i = 0; i < chunks.length; i += 1) {
    const chunkText = chunks[i];
    let embedding = [];

    if (isAiEnabled()) {
      try {
        embedding = (await createEmbedding(chunkText)) || [];
      } catch {
        embedding = [];
      }
    }

    await KnowledgeChunk.create({
      workspaceId,
      documentId: document._id,
      chunkIndex: i,
      text: chunkText,
      embedding,
      tokenCount: estimateTokenCount(chunkText)
    });

    storedCount += 1;
  }

  document.status = 'indexed';
  document.chunkCount = storedCount;
  document.lastIndexedAt = new Date();
  await document.save();
  return document;
}

export async function indexKnowledgeFromAssetUpload({ workspaceId, asset, file }) {
  const extracted = await extractKnowledgeTextFromUpload(file);
  const finalText =
    normalizeText(extracted) ||
    `Uploaded business asset: ${file?.originalname || 'file'} (${file?.mimetype || 'unknown type'}).`;

  return indexKnowledgeDocument({
    workspaceId,
    title: file?.originalname || 'Uploaded Asset',
    text: finalText,
    sourceType: 'asset',
    sourceAssetId: asset?._id,
    metadata: {
      mimeType: file?.mimetype,
      originalUrl: asset?.originalUrl,
      publicId: asset?.publicId
    }
  });
}

export async function reindexKnowledgeForAsset({ workspaceId, asset, file }) {
  const existingDocs = await KnowledgeDocument.find({
    workspaceId,
    sourceType: 'asset',
    sourceAssetId: asset?._id
  }).select('_id');

  if (existingDocs.length) {
    const docIds = existingDocs.map((doc) => doc._id);
    await KnowledgeChunk.deleteMany({ workspaceId, documentId: { $in: docIds } });
    await KnowledgeDocument.deleteMany({ _id: { $in: docIds } });
  }

  return indexKnowledgeFromAssetUpload({ workspaceId, asset, file });
}

export async function listKnowledgeDocuments(workspaceId) {
  return KnowledgeDocument.find({ workspaceId }).sort({ createdAt: -1 });
}

export async function deleteKnowledgeDocument({ workspaceId, documentId }) {
  const document = await KnowledgeDocument.findOneAndDelete({
    _id: documentId,
    workspaceId
  });

  if (!document) return null;

  await KnowledgeChunk.deleteMany({ workspaceId, documentId });
  return document;
}

export async function answerQuestionWithRag({ workspaceId, question }) {
  const topK = Math.max(1, Number(env.RAG_TOP_K || 5));
  const minScore = Math.max(0, Number(env.RAG_MIN_SCORE || 0));
  const chunks = await KnowledgeChunk.find({ workspaceId }).limit(500);
  if (!chunks.length) {
    return {
      answered: false,
      answer: '',
      sources: []
    };
  }

  let questionEmbedding = null;
  if (isAiEnabled()) {
    try {
      questionEmbedding = await createEmbedding(question);
    } catch {
      questionEmbedding = null;
    }
  }

  const scored = chunks
    .map((chunk) => {
      const lexical = lexicalScore(question, chunk.text);
      const semantic =
        questionEmbedding?.length && chunk.embedding?.length
          ? cosineSimilarity(questionEmbedding, chunk.embedding)
          : 0;
      const hybrid = semantic > 0 ? semantic * 0.8 + lexical * 0.2 : lexical;
      return { chunk, score: hybrid, lexical, semantic };
    })
    .sort((a, b) => b.score - a.score);

  const relevant = scored.filter((item) => item.score >= minScore).slice(0, topK);
  const selected = relevant.length ? relevant : scored.slice(0, topK);

  if (!selected.length) {
    return { answered: false, answer: '', sources: [] };
  }

  const docIds = [...new Set(selected.map((item) => item.chunk.documentId.toString()))];
  const docs = await KnowledgeDocument.find({ _id: { $in: docIds } });
  const docMap = new Map(docs.map((doc) => [doc._id.toString(), doc]));

  let answer = '';
  if (isAiEnabled()) {
    try {
      answer = await generateAnswer({
        question,
        contextChunks: selected.map((item) => ({ text: item.chunk.text }))
      });
    } catch {
      answer = '';
    }
  }
  if (!answer) answer = fallbackAnswerFromChunks(selected.map((item) => item.chunk));

  return {
    answered: true,
    answer,
    sources: selected.map((item) => {
      const doc = docMap.get(item.chunk.documentId.toString());
      return {
        documentId: item.chunk.documentId,
        title: doc?.title || 'Untitled',
        score: Number(item.score.toFixed(4))
      };
    })
  };
}
